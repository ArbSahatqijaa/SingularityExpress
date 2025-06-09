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
            messages = data.get("messages", [])
            model = data.get("model", "gpt-4o")

            # Get last user message content for easy reference
            user_message = None
            for m in reversed(messages):
                if m.get("role") == "user":
                    user_message = m.get("content")
                    break

            # Get RapidAPI key from environment
            rapidapi_key = os.getenv('RAPIDAPI_KEY')
            if not rapidapi_key:
                logger.error("RAPIDAPI_KEY not found in environment variables")
                return JsonResponse({"error": "API key not configured"}, status=500)

            # Clean up the API key (remove any whitespace)
            rapidapi_key = rapidapi_key.strip()

            url = "https://chatgpt-42.p.rapidapi.com/gpt4o"
            headers = {
                "Content-Type": "application/json",
                "x-rapidapi-host": "chatgpt-42.p.rapidapi.com",
                "x-rapidapi-key": rapidapi_key
            }
            payload = {
                "messages": messages,
                "model": model
            }

            logger.info(f"Sending request to RapidAPI with model: {model}")
            response = requests.post(url, headers=headers, json=payload)
            
            # Log the response status and headers for debugging
            logger.info(f"RapidAPI response status: {response.status_code}")
            logger.info(f"RapidAPI response headers: {dict(response.headers)}")
            
            try:
                response.raise_for_status()
                response_data = response.json()
                logger.info(f"RapidAPI response data: {response_data}")
            except requests.exceptions.HTTPError as e:
                logger.error(f"HTTP error from RapidAPI: {e}")
                logger.error(f"Response content: {response.text}")
                return JsonResponse({
                    "error": "AI service error",
                    "details": str(e),
                    "response": response.text
                }, status=response.status_code)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse RapidAPI response: {e}")
                logger.error(f"Raw response: {response.text}")
                return JsonResponse({
                    "error": "Invalid response from AI service",
                    "details": str(e)
                }, status=500)

            # Extract AI response text
            ai_response = None
            if "choices" in response_data and response_data["choices"]:
                ai_response = response_data["choices"][0].get("message", {}).get("content")
            elif "response" in response_data:
                ai_response = response_data.get("response")
            else:
                ai_response = str(response_data)

            if not ai_response:
                logger.error("No AI response found in the response data")
                return JsonResponse({
                    "error": "No response from AI service",
                    "details": "The AI service returned an empty response"
                }, status=500)

            # Clean up the response - filter out JSON and escape sequences
            if isinstance(ai_response, str):
                # First, try to extract just the content if it's in a JSON-like structure
                if "'result':" in ai_response or '"result":' in ai_response:
                    # Find the content between the first quote after 'result' and the last quote before 'status'
                    start_idx = ai_response.find("'result':") or ai_response.find('"result":')
                    if start_idx != -1:
                        start_idx = ai_response.find("'", start_idx + 8) or ai_response.find('"', start_idx + 8)
                        if start_idx != -1:
                            start_idx += 1  # Move past the quote
                            end_idx = ai_response.rfind("'status':") or ai_response.rfind('"status":')
                            if end_idx != -1:
                                ai_response = ai_response[start_idx:end_idx].strip()

                # Remove any remaining JSON-like characters
                ai_response = ai_response.replace("'", "").replace('"', '')
                ai_response = ai_response.replace('{', '').replace('}', '')
                ai_response = ai_response.replace('result:', '').replace('status:', '')
                ai_response = ai_response.replace('server_code:', '')
                ai_response = ai_response.replace('True', '').replace('False', '')
                ai_response = ai_response.replace('dg', '')
                
                # Clean up escape sequences
                ai_response = ai_response.replace('\\n', '\n')
                ai_response = ai_response.replace('\\t', ' ')
                ai_response = ai_response.replace('\\"', '"')
                ai_response = ai_response.replace("\\'", "'")
                
                # Remove markdown formatting
                ai_response = ai_response.replace('**', '')
                ai_response = ai_response.replace('*', '')
                
                # Clean up whitespace and newlines
                lines = [line.strip() for line in ai_response.split('\n') if line.strip()]
                ai_response = '\n'.join(lines)
                
                # Remove any double spaces
                ai_response = ' '.join(ai_response.split())

            # Save to MongoDB
            try:
                db_handle, mongo_client = get_db_handle()
                mongo_client.admin.command('ping')
                ai_qa_collection = db_handle["ai_questions_and_answers"]

                qa_document = {
                    "question": user_message,
                    "answer": ai_response,
                    "user_id": str(request.user.user_id),
                    "timestamp": datetime.utcnow(),
                    "model_used": model,
                    "conversation_history": messages
                }

                insert_result = ai_qa_collection.insert_one(qa_document)
                logger.info(f"Stored conversation with ID {insert_result.inserted_id}")

            except Exception as mongo_err:
                logger.error(f"Error storing to MongoDB: {mongo_err}")
                logger.error(f"Full traceback: {traceback.format_exc()}")
                # Continue even if MongoDB storage fails

            return JsonResponse({
                "result": ai_response,
                "model": model,
                "timestamp": datetime.utcnow().isoformat()
            })

        except requests.exceptions.RequestException as e:
            logger.error(f"Request to external API failed: {e}")
            return JsonResponse({
                "error": "Failed to connect to AI service",
                "details": str(e)
            }, status=500)
        except Exception as e:
            logger.error(f"Unexpected error in chat_with_api: {e}")
            logger.error(traceback.format_exc())
            return JsonResponse({
                "error": "Internal server error",
                "details": str(e)
            }, status=500)

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
