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

        self.group_name = f"user_{self.user.pk}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.channel_layer.group_add('lobby', self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
        await self.channel_layer.group_discard('lobby', self.channel_name)

    async def receive_json(self, content, **kwargs):
        action = content.get("action")
        target_id = content.get("target")
        if not action:
            return  # ignore malformed
        payload = {k: v for k, v in content.items() if k not in ("action", "target")}

        # Database operations for answer/hangup
        if action == 'answer':
            await self._create_call_record(caller_id=target_id, callee_id=self.user.pk)
        elif action == 'hangup':
            await self._end_call_record(participants=[self.user.pk, target_id])

        # hangup action might not include target id (already set remoteUser). ensure target_id.
        # Send to the target user's group (if there is one)
        if target_id:
            await self.channel_layer.group_send(
                f"user_{target_id}",
                {
                    "type": "signal.message",
                    "action": action,
                    "from_user": self.user.pk,
                    **payload,
                },
            )

    # Handler for forwarded messages
    async def signal_message(self, event):
        response = {k: v for k, v in event.items() if k not in ("type",)}
        # Map certain action names for the recipient
        action = event.get("action")
        if action == "call":
            response["action"] = "incoming_call"
        elif action == "answer":
            response["action"] = "call_answered"
        elif action == "ice":
            response["action"] = "ice"
        else:
            response["action"] = action
        await self.send_json(response)

    async def broadcast_users(self, event):
        """Handle broadcasts for new/updated users coming from signals."""
        await self.send_json({
            'action': event.get('event'),
            'user': event.get('user'),
        })

    # ────────────────────── Mongo helpers ──────────────────────────
    @database_sync_to_async
    def _create_call_record(self, caller_id, callee_id):
        logger.info(f"Creating call record: caller={caller_id}, callee={callee_id}")
        db, _ = get_db_handle(db_name='singularityexpressCommunication')
        try:
            db.video_calls.insert_one({
                'caller_id': caller_id,
                'callee_id': callee_id,
                'start_time': datetime.utcnow(),
                'status': 'active',
            })
            logger.info(f"Call record created in MongoDB")
        except Exception as e:
            logger.error(f"MongoDB insert error: {e}")

    @database_sync_to_async
    def _end_call_record(self, participants):
        logger.info(f"Ending call record for participants: {participants}")
        db, _ = get_db_handle(db_name='singularityexpressCommunication')
        try:
            db.video_calls.update_one(
                {
                    'caller_id': {'$in': participants},
                    'callee_id': {'$in': participants},
                    'status': 'active',
                },
                {
                    '$set': {
                        'end_time': datetime.utcnow(),
                        'status': 'ended',
                    }
                }
            )
            logger.info(f"Call record updated in MongoDB")
        except Exception as e:
            logger.error(f"MongoDB update error: {e}") 