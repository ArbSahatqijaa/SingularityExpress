import os
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from datetime import datetime
import logging
import traceback
from utils import get_db_handle
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from bson import ObjectId

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def chat_with_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            messages = data.get("messages", [{"role": "user", "content": "hi"}])
            model = data.get("model", "gpt-4o")

            # Get last user message content for easy reference
            user_message = None
            for m in reversed(messages):
                if m.get("role") == "user":
                    user_message = m.get("content")
                    break

            url = "https://chatgpt-42.p.rapidapi.com/gpt4o"
            headers = {
                "Content-Type": "application/json",
                "x-rapidapi-host": "chatgpt-42.p.rapidapi.com",
                "x-rapidapi-key": os.getenv('RAPIDAPI_KEY')
            }
            payload = {
                "messages": messages,
                "model": model
            }

            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            response_data = response.json()

            # Extract AI response text depending on your API response format
            ai_response = None
            if "choices" in response_data and response_data["choices"]:
                ai_response = response_data["choices"][0].get("message", {}).get("content")
            elif "response" in response_data:
                ai_response = response_data.get("response")
            else:
                ai_response = str(response_data)

            # Save to MongoDB only if user is authenticated
            logger.info(f"User authentication status - is_authenticated: {hasattr(request, 'user') and request.user.is_authenticated}")
            if hasattr(request, 'user') and request.user.is_authenticated:
                try:
                    logger.info("Attempting to connect to MongoDB...")
                    db_handle, mongo_client = get_db_handle()
                    mongo_client.admin.command('ping')  # verify connection
                    logger.info("MongoDB connection successful")
                    ai_qa_collection = db_handle["ai_questions_and_answers"]

                    qa_document = {
                        "question": user_message,
                        "answer": ai_response,
                        "user_id": str(request.user.user_id),  # Using user_id instead of id
                        "timestamp": datetime.utcnow(),
                        "model_used": model,
                        "conversation_history": messages
                    }

                    logger.info(f"Attempting to store document: {qa_document}")
                    insert_result = ai_qa_collection.insert_one(qa_document)
                    logger.info(f"Successfully stored conversation with ID {insert_result.inserted_id}")

                except Exception as mongo_err:
                    logger.error(f"Error storing to MongoDB: {mongo_err}")
                    logger.error(f"Full traceback: {traceback.format_exc()}")

            return JsonResponse(response_data, status=response.status_code)

        except requests.exceptions.RequestException as e:
            logger.error(f"Request to external API failed: {e}")
            return JsonResponse({"error": str(e)}, status=500)
        except Exception as e:
            logger.error(f"Unexpected error in chat_with_api: {e}")
            logger.error(traceback.format_exc())
            return JsonResponse({"error": "Internal Server Error"}, status=500)

    return JsonResponse({"error": "Only POST allowed"}, status=405)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def test_mongodb_connection(request):
    """
    Test endpoint to verify MongoDB connection and collection access
    """
    try:
        logger.info("Testing MongoDB connection...")
        db_handle, mongo_client = get_db_handle()
        logger.info(f"MongoDB connection successful. Database: {db_handle.name}")
        
        # Test collection access
        ai_qa_collection = db_handle["ai_questions_and_answers"]
        
        # Try to insert a test document
        test_doc = {
            "question": "Test question",
            "answer": "Test answer",
            "user_id": str(request.user.user_id),
            "timestamp": datetime.utcnow(),
            "model_used": "test",
            "conversation_history": []
        }
        
        insert_result = ai_qa_collection.insert_one(test_doc)
        logger.info(f"Test document inserted with ID: {insert_result.inserted_id}")
        
        # Try to read it back
        stored_doc = ai_qa_collection.find_one({"_id": insert_result.inserted_id})
        if stored_doc:
            # Convert ObjectId to string for JSON serialization
            stored_doc['_id'] = str(stored_doc['_id'])
            stored_doc['timestamp'] = stored_doc['timestamp'].isoformat()
            
            # Clean up test document
            ai_qa_collection.delete_one({"_id": insert_result.inserted_id})
            
            return Response({
                'status': 'success',
                'message': 'MongoDB connection and collection access working correctly',
                'test_document': stored_doc
            })
        else:
            return Response({
                'status': 'error',
                'message': 'Could not retrieve test document after insertion'
            }, status=500)
            
    except Exception as e:
        logger.error(f"MongoDB test failed: {str(e)}")
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return Response({
            'status': 'error',
            'message': f'MongoDB test failed: {str(e)}'
        }, status=500)
