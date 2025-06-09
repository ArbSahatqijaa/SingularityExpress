from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
import jwt
from django.conf import settings
from datetime import datetime
from utils import get_db_handle
import logging

logger = logging.getLogger(__name__)

class CallConsumer(AsyncJsonWebsocketConsumer):
    """WebSocket consumer handling WebRTC signaling between users.

    The consumer authenticates the connecting user (via Django session or JWT in scope)
    and joins a personal group named `user_{id}`. Incoming JSON messages are expected
    to contain an `action` field describing the signaling step and a `target` field
    with the recipient user id. The payload of the signaling data should be passed
    in the remaining fields.

    Flow:
        1. Caller sends    {action: "call", target: <calleeId>, offer: {...}}
        2. Callee receives {action: "incoming_call", from: <callerId>, offer: {...}}
        3. Callee answers  {action: "answer", target: <callerId>, answer: {...}}
        4. Caller receives {action: "call_answered", from: <calleeId>, answer: {...}}
        5. ICE exchange    {action: "ice", target: <otherId>, candidate: {...}}
    """

    # Add class variable to track online users
    online_users = set()

    async def connect(self):
        # Try to fetch user from standard authentication first
        self.user = self.scope.get("user", AnonymousUser())

        if self.user is None or self.user.is_anonymous:
            # Fallback to JWT passed as "token" query param
            query_string = self.scope.get("query_string", b"").decode()
            params = dict(pair.split("=") for pair in query_string.split("&") if "=" in pair)
            raw_token = params.get("token")
            if raw_token:
                try:
                    UntypedToken(raw_token)  # Validate token integrity and expiry
                    decoded = jwt.decode(raw_token, settings.SECRET_KEY, algorithms=["HS256"])
                    user_id = decoded.get(settings.SIMPLE_JWT.get("USER_ID_CLAIM", "user_id"))
                    self.user = await database_sync_to_async(get_user_model().objects.get)(pk=user_id)
                except (InvalidToken, TokenError, get_user_model().DoesNotExist, jwt.InvalidTokenError):
                    self.user = AnonymousUser()

        if self.user.is_anonymous:
            await self.close()
            return

        await self.accept()
        
        # Add user to their personal channel
        self.group_name = f"user_{self.user.pk}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.channel_layer.group_add('lobby', self.channel_name)

        # Add user to online users set
        self.online_users.add(self.user.pk)
        
        # Send current online users list to the newly connected user
        await self.send_json({
            'action': 'online_users_list',
            'users': list(self.online_users)
        })

        # Get undelivered messages for this user
        try:
            db, _ = get_db_handle(db_name='singularityexpressCommunication')
            messages_collection = db["messages"]
            
            # Find messages where this user is the recipient and status is not 'delivered'
            undelivered_messages = await database_sync_to_async(list)(
                messages_collection.find({
                    "recipient_id": self.user.pk,
                    "status": {"$ne": "delivered"}
                }).sort("timestamp", 1)
            )

            logger.info(f"Found {len(undelivered_messages)} undelivered messages for user {self.user.pk}")

            # Send notifications for undelivered messages
            for message in undelivered_messages:
                # Update message status to delivered
                await database_sync_to_async(messages_collection.update_one)(
                    {"_id": message["_id"]},
                    {"$set": {"status": "delivered"}}
                )

                # Convert ObjectId to string for JSON serialization
                message["_id"] = str(message["_id"])

                # Send notification to user
                await self.send_json({
                    "action": "chat_message_received",
                    "message": {
                        **message,
                        "status": "delivered",
                        "sender_id": message["sender_id"],
                        "recipient_id": self.user.pk,
                        "content": message["content"],
                        "message_type": message.get("message_type", "text"),
                        "timestamp": message["timestamp"],
                        "message_id": message["message_id"]
                    }
                })

                logger.info(f"Sent notification for undelivered message {message['message_id']} to user {self.user.pk}")

        except Exception as e:
            logger.error(f"Error fetching undelivered messages: {e}", exc_info=True)

        # Notify others that user is online
        await self.channel_layer.group_send('lobby', {
            'type': 'broadcast.users',
            'event': 'user_online',
            'user': {
                'user_id': self.user.pk,
                'username': self.user.username,
            }
        })

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            # Remove user from online users set
            self.online_users.discard(self.user.pk)
            
            # Notify others that user is offline
            await self.channel_layer.group_send('lobby', {
                'type': 'broadcast.users',
                'event': 'user_offline',
                'user': {
                    'user_id': self.user.pk,
                    'username': self.user.username,
                }
            })
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
        await self.channel_layer.group_discard('lobby', self.channel_name)

    async def receive_json(self, content, **kwargs):
        action = content.get("action")
        target_id = content.get("target")
        if not action:
            return  # ignore malformed messages

        # Handle chat messages
        if action == 'send_chat_message':
            try:
                logger.info(f"Received chat message: {content}")
                db, _ = get_db_handle(db_name='singularityexpressCommunication')
                logger.info(f"MongoDB connection established: {db}")
                
                messages_collection = db["messages"]
                logger.info(f"Accessing messages collection: {messages_collection}")
                
                # Create message data with unique identifier
                message_data = {
                    "conversation_id": content.get("conversation_id"),
                    "sender_id": self.user.pk,
                    "recipient_id": content.get("recipient_id"),
                    "content": content.get("content"),
                    "message_type": content.get("message_type", "text"),
                    "timestamp": content.get("timestamp", datetime.utcnow().isoformat()),
                    "status": "sent",
                    "message_id": f"{content.get('conversation_id')}_{self.user.pk}_{content.get('timestamp', datetime.utcnow().isoformat())}"
                }
                
                logger.info(f"Attempting to insert message data: {message_data}")

                # Use find_one_and_update with upsert to ensure atomic operation and prevent duplicates
                try:
                    result = await database_sync_to_async(messages_collection.find_one_and_update)(
                        {"message_id": message_data["message_id"]},
                        {"$setOnInsert": message_data},
                        upsert=True,
                        return_document=True
                    )
                    logger.info(f"MongoDB operation result: {result}")

                    if result:
                        # Convert ObjectId to string for JSON serialization
                        result["_id"] = str(result["_id"])
                        logger.info(f"Message stored successfully with ID: {result['_id']}")
                        
                        # Send to recipient if they're online
                        if target_id:
                            logger.info(f"Sending message to recipient: {target_id}")
                            # Update message status to delivered immediately
                            update_result = await database_sync_to_async(messages_collection.update_one)(
                                {"message_id": message_data["message_id"]},
                                {"$set": {"status": "delivered"}}
                            )
                            logger.info(f"Message status update result: {update_result.modified_count} documents modified")
                            
                            # Send message to recipient
                            await self.channel_layer.group_send(
                                f"user_{target_id}",
                                {
                                    "type": "signal.message",
                                    "action": "chat_message_received",
                                    "message": {**result, "status": "delivered"},
                                }
                            )
                        
                        # Send confirmation to sender
                        await self.send_json({
                            "action": "message_sent",
                            "message": result,
                        })
                    else:
                        logger.error("Failed to store message in MongoDB - no result returned")

                except Exception as db_error:
                    logger.error(f"Database operation error: {db_error}", exc_info=True)
                    raise

            except Exception as e:
                logger.error(f"Error handling chat message: {e}", exc_info=True)
                await self.send_json({
                    "action": "message_error",
                    "error": str(e)
                })
                return

        # Handle call actions with MongoDB integration
        elif action == 'call':
            if content.get('create_call_record'):
                # Create call record in MongoDB
                await self._create_call_record(self.user.pk, target_id)
            
            if target_id:
                await self.channel_layer.group_send(
                    f"user_{target_id}",
                    {
                        "type": "signal.message",
                        "action": "incoming_call",
                        "from_user": self.user.pk,
                        "offer": content.get("offer"),
                        "create_call_record": True
                    },
                )

        elif action == 'answer':
            if content.get('update_call_record'):
                # Update call record status to 'connected'
                await self._update_call_record(self.user.pk, content.get('from_user'), 'connected')
            
            if target_id:
                await self.channel_layer.group_send(
                    f"user_{target_id}",
                    {
                        "type": "signal.message",
                        "action": "call_answered",
                        "from_user": self.user.pk,
                        "answer": content.get("answer")
                    },
                )

        elif action == 'hangup':
            if content.get('end_call_record'):
                # End call record in MongoDB
                participants = [self.user.pk, target_id]
                await self._end_call_record(participants, declined=content.get('declined', False))
            
            if target_id:
                await self.channel_layer.group_send(
                    f"user_{target_id}",
                    {
                        "type": "signal.message",
                        "action": "hangup",
                        "from_user": self.user.pk,
                        "declined": content.get('declined', False)
                    },
                )

        elif action == 'ice':
            if target_id:
                await self.channel_layer.group_send(
                    f"user_{target_id}",
                    {
                        "type": "signal.message",
                        "action": "ice",
                        "from_user": self.user.pk,
                        "candidate": content.get("candidate")
                    },
                )

        # Handle call quality updates
        elif action == 'call_quality_update':
            if target_id and content.get('quality_metrics'):
                participants = [self.user.pk, target_id]
                await self._update_call_quality(participants, content['quality_metrics'])
                return

    async def signal_message(self, event):
        """Handle forwarded messages from other users."""
        response = {k: v for k, v in event.items() if k not in ("type",)}
        action = event.get("action")
        
        # Map certain action names for the recipient
        action_mapping = {
            "call": "incoming_call",
            "answer": "call_answered",
            "ice": "ice",
            "chat_message_received": "chat_message_received"
        }
        
        response["action"] = action_mapping.get(action, action)
        
        # For chat messages, ensure we include the full message object
        if action == "chat_message_received":
            response["message"] = event.get("message")
            
        await self.send_json(response)

    async def broadcast_users(self, event):
        """Handle broadcasts for user status changes."""
        try:
            await self.send_json({
                'action': event.get('event'),
                'user': event.get('user'),
            })
        except Exception as e:
            logger.warning(f"Failed to broadcast user status to client: {e}")
            # If the client is disconnected, remove them from the group
            if "Disconnected" in str(e):
                try:
                    await self.channel_layer.group_discard('lobby', self.channel_name)
                    logger.info(f"Removed disconnected client from lobby group: {self.channel_name}")
                except Exception as group_error:
                    logger.error(f"Error removing client from group: {group_error}")

    # ────────────────────── Mongo helpers ──────────────────────────
    @database_sync_to_async
    def _create_call_record(self, caller_id, callee_id):
        logger.info(f"Creating call record: caller={caller_id}, callee={callee_id}")
        db, _ = get_db_handle(db_name='singularityexpressCommunication')
        try:
            start_time = datetime.utcnow()
            db.video_calls.insert_one({
                'caller_id': caller_id,
                'callee_id': callee_id,
                'start_time': start_time,
                'status': 'active',
                'created_at': start_time,
                'updated_at': start_time,
                'call_quality': {
                    'video_quality': 'unknown',
                    'audio_quality': 'unknown',
                    'network_quality': 'unknown'
                }
            })
            logger.info(f"Call record created in MongoDB")
        except Exception as e:
            logger.error(f"MongoDB insert error: {e}")

    @database_sync_to_async
    def _update_call_record(self, caller_id, callee_id, status, quality_metrics=None):
        logger.info(f"Updating call record: caller={caller_id}, callee={callee_id}, status={status}")
        db, _ = get_db_handle(db_name='singularityexpressCommunication')
        try:
            update_data = {
                'status': status,
                'updated_at': datetime.utcnow()
            }
            
            if quality_metrics:
                update_data['call_quality'] = quality_metrics
            
            if status == 'connected':
                # Calculate duration when call is connected
                call_record = db.video_calls.find_one({
                    'caller_id': {'$in': [caller_id, callee_id]},
                    'callee_id': {'$in': [caller_id, callee_id]},
                    'status': 'active'
                })
                if call_record:
                    duration = calculate_call_duration(call_record['start_time'])
                    update_data['duration'] = duration
            
            db.video_calls.update_one(
                {
                    'caller_id': {'$in': [caller_id, callee_id]},
                    'callee_id': {'$in': [caller_id, callee_id]},
                    'status': 'active'
                },
                {'$set': update_data}
            )
            logger.info(f"Call record updated in MongoDB")
        except Exception as e:
            logger.error(f"MongoDB update error: {e}")

    @database_sync_to_async
    def _end_call_record(self, participants, declined=False, quality_metrics=None):
        logger.info(f"Ending call record for participants: {participants}, declined: {declined}")
        db, _ = get_db_handle(db_name='singularityexpressCommunication')
        try:
            end_time = datetime.utcnow()
            
            # Find the active call record
            call_record = db.video_calls.find_one({
                'caller_id': {'$in': participants},
                'callee_id': {'$in': participants},
                'status': {'$in': ['active', 'connected']}
            })
            
            if call_record:
                # Calculate final duration
                duration = calculate_call_duration(call_record['start_time'], end_time)
                
                update_data = {
                    'end_time': end_time,
                    'status': 'declined' if declined else 'ended',
                    'updated_at': end_time,
                    'duration': duration
                }
                
                if quality_metrics:
                    update_data['call_quality'] = quality_metrics
                
                db.video_calls.update_one(
                    {'_id': call_record['_id']},
                    {'$set': update_data}
                )
                logger.info(f"Call record updated in MongoDB with duration: {duration}s")
        except Exception as e:
            logger.error(f"MongoDB update error: {e}")

    @database_sync_to_async
    def _update_call_quality(self, participants, quality_metrics):
        """Update call quality metrics during an active call."""
        logger.info(f"Updating call quality for participants: {participants}")
        db, _ = get_db_handle(db_name='singularityexpressCommunication')
        try:
            db.video_calls.update_one(
                {
                    'caller_id': {'$in': participants},
                    'callee_id': {'$in': participants},
                    'status': 'connected'
                },
                {
                    '$set': {
                        'call_quality': quality_metrics,
                        'updated_at': datetime.utcnow()
                    }
                }
            )
            logger.info("Call quality metrics updated in MongoDB")
        except Exception as e:
            logger.error(f"MongoDB update error: {e}") 