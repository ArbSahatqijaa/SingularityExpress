from bson import ObjectId
from django.http import JsonResponse, FileResponse, HttpResponse
from django.conf import settings
import sys
import os
import json
import logging
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import MultiPartParser, FormParser
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import uuid
import mimetypes
from django.views.decorators.http import require_http_methods
from rest_framework.permissions import IsAuthenticated
from utils import get_db_handle

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@api_view(['POST'])
def create_message(request):
    try:
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

@require_http_methods(["GET"])
@permission_classes([IsAuthenticated])
def download_chat_file(request, filename):
    try:
        if not filename:
            logger.error("No filename provided")
            return JsonResponse({
                "status": "error",
                "message": "No filename provided"
            }, status=400)

        # Get the full path of the file
        file_path = os.path.join(settings.MEDIA_ROOT, 'chat_files', filename)
        logger.info(f"Attempting to download file from path: {file_path}")
        
        if not os.path.exists(file_path):
            logger.error(f"File not found at path: {file_path}")
            return JsonResponse({
                "status": "error",
                "message": "File not found"
            }, status=404)

        # Get the original filename from the database or use the stored filename
        original_filename = filename.split('_', 1)[-1] if '_' in filename else filename
        logger.info(f"Original filename: {original_filename}")
        
        # Get the file's mime type
        content_type, _ = mimetypes.guess_type(file_path)
        if content_type is None:
            content_type = 'application/octet-stream'
        logger.info(f"Content type: {content_type}")

        try:
            # Open the file in binary mode
            file = open(file_path, 'rb')
            file_size = os.path.getsize(file_path)
            logger.info(f"File size: {file_size} bytes")
            
            # Create the response with appropriate headers
            response = FileResponse(file, as_attachment=True, filename=original_filename)
            response['Content-Type'] = content_type
            response['Content-Length'] = file_size
            
            # Set content disposition to force download with original filename
            response['Content-Disposition'] = f'attachment; filename="{original_filename}"; filename*=UTF-8\'\'{original_filename}'
            
            # Add cache control headers to prevent caching
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response['Pragma'] = 'no-cache'
            response['Expires'] = '0'
            
            # Add CORS headers
            response['Access-Control-Allow-Origin'] = request.headers.get('Origin', 'http://localhost:3000')
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Expose-Headers'] = 'Content-Disposition, Content-Length, Content-Type'
            
            logger.info(f"Successfully preparing file download: {original_filename}")
            return response

        except Exception as e:
            logger.error(f"Error opening file: {str(e)}")
            if 'file' in locals():
                file.close()
            raise

    except Exception as e:
        logger.error(f"Error in download_chat_file: {e}", exc_info=True)
        return JsonResponse({
            "status": "error",
            "message": f"Server error: {str(e)}"
        }, status=500)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_chat_file(request):
    try:
        if 'file' not in request.FILES:
            return JsonResponse({
                "status": "error",
                "message": "No file provided"
            }, status=400)

        file = request.FILES['file']
        sender_id = request.data.get('sender_id')
        recipient_id = request.data.get('recipient_id')

        if not all([file, sender_id, recipient_id]):
            return JsonResponse({
                "status": "error",
                "message": "Missing required fields"
            }, status=400)

        # Ensure the chat_files directory exists
        chat_files_dir = os.path.join(settings.MEDIA_ROOT, 'chat_files')
        os.makedirs(chat_files_dir, exist_ok=True)

        # Generate a unique filename while preserving the original extension
        ext = os.path.splitext(file.name)[1]
        unique_filename = f"{uuid.uuid4()}{ext}"
        filename = f"chat_files/{unique_filename}"
        
        # Save the file
        path = default_storage.save(filename, ContentFile(file.read()))
        logger.info(f"File saved successfully at: {path}")
        
        # Return the unique filename along with other data
        return JsonResponse({
            "status": "success",
            "url": f"/api/chat/download/{unique_filename}",  # Changed to use download endpoint
            "filename": file.name,
            "file_type": file.content_type,
            "size": file.size,
            "stored_filename": unique_filename  # Add this for reference
        })

    except Exception as e:
        logger.error(f"Error in upload_chat_file: {e}", exc_info=True)
        return JsonResponse({
            "status": "error",
            "message": f"Server error: {str(e)}"
        }, status=500)
