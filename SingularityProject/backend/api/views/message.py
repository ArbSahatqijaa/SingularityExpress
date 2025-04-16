from bson import ObjectId
from django.http import JsonResponse
from django.conf import settings
import sys
import os
import json
import logging
from rest_framework.decorators import api_view

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@api_view(['POST'])
def create_message(request):
    try:
        # Import the get_db_handle function here to avoid circular imports
        from utils import get_db_handle
        
        logger.info("Starting create_message function")
        db_handle, mongo_client = get_db_handle()
        logger.info(f"MongoDB connection established: {db_handle}")

        # Parse request data
        if request.body:
            if isinstance(request.body, bytes):
                try:
                    data = json.loads(request.body)
                    logger.info(f"Request data: {data}")
                except json.JSONDecodeError as e:
                    logger.error(f"JSON decode error: {e}")
                    return JsonResponse({"status": "error", "message": f"Invalid JSON: {str(e)}"}, status=400)
            else:
                data = request.data
                logger.info(f"Request data from request.data: {data}")
        else:
            logger.error("No request body provided")
            return JsonResponse({"status": "error", "message": "No request body provided"}, status=400)
        
        # Define message data
        message_data = {
            "conversation_id": data.get('conversation_id'),
            "sender": data.get('sender'),
            "content": data.get('content'),
            "timestamp": data.get('timestamp', None)
        }
        
        logger.info(f"Message data to insert: {message_data}")

        # Access the 'messages' collection and insert the message
        messages_collection = db_handle["messages"]
        insert_result = messages_collection.insert_one(message_data)
        logger.info(f"Insert result: {insert_result.inserted_id}")

        # Return the message ID as part of the response
        return JsonResponse({"status": "success", "message": "Message created successfully!", "id": str(insert_result.inserted_id)})
    
    except Exception as e:
        logger.error(f"Error in create_message: {e}", exc_info=True)
        return JsonResponse({"status": "error", "message": f"Server error: {str(e)}"}, status=500)

@api_view(['GET'])
def get_messages(request, conversation_id):
    try:
        # Import the get_db_handle function here to avoid circular imports
        from utils import get_db_handle
        logger.info(f"Getting messages for conversation: {conversation_id}")
        
        db_handle, mongo_client = get_db_handle()
        
        # Access the 'messages' collection
        messages_collection = db_handle["messages"]
        
        # Fetch messages for the specified conversation
        messages = list(messages_collection.find({"conversation_id": conversation_id}))
        logger.info(f"Found {len(messages)} messages")
        
        # Convert ObjectId to string for JSON serialization
        for message in messages:
            message['_id'] = str(message['_id'])
        
        return JsonResponse({"status": "success", "messages": messages})
    
    except Exception as e:
        logger.error(f"Error in get_messages: {e}", exc_info=True)
        return JsonResponse({"status": "error", "message": f"Server error: {str(e)}"}, status=500)

@api_view(['PUT'])
def update_message(request, message_id):
    try:
        # Import the get_db_handle function here to avoid circular imports
        from utils import get_db_handle
        
        db_handle, mongo_client = get_db_handle()

        # Parse request data
        data = json.loads(request.body) if isinstance(request.body, bytes) else request.data

        # Access the 'messages' collection
        messages_collection = db_handle["messages"]

        # Convert the message_id to ObjectId
        try:
            message_id = ObjectId(message_id)
        except Exception as e:
            return JsonResponse({"status": "failure", "message": "Invalid message ID."})

        # Update the message with the specific ID
        update_result = messages_collection.update_one(
            {"_id": message_id},
            {"$set": {"content": data.get('content')}}
        )

        if update_result.modified_count > 0:
            return JsonResponse({"status": "success", "message": "Message updated successfully!"})
        else:
            return JsonResponse({"status": "failure", "message": "Message not found."})
    
    except Exception as e:
        logger.error(f"Error in update_message: {e}", exc_info=True)
        return JsonResponse({"status": "error", "message": f"Server error: {str(e)}"}, status=500)

@api_view(['DELETE'])
def delete_message(request, message_id):
    try:
        # Import the get_db_handle function here to avoid circular imports
        from utils import get_db_handle
        
        db_handle, mongo_client = get_db_handle()

        # Access the 'messages' collection
        messages_collection = db_handle["messages"]

        # Convert the message_id to ObjectId
        try:
            message_id = ObjectId(message_id)
        except Exception as e:
            return JsonResponse({"status": "failure", "message": "Invalid message ID."})

        # Delete the message with the specific ID
        delete_result = messages_collection.delete_one({"_id": message_id})

        if delete_result.deleted_count > 0:
            return JsonResponse({"status": "success", "message": "Message deleted successfully!"})
        else:
            return JsonResponse({"status": "failure", "message": "Message not found."})
    
    except Exception as e:
        logger.error(f"Error in delete_message: {e}", exc_info=True)
        return JsonResponse({"status": "error", "message": f"Server error: {str(e)}"}, status=500)
