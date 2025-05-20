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

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def chat_with_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)

            messages = data.get("messages", [{"role": "user", "content": "hi"}])
            model = data.get("model", "gpt-4o-mini")

            # Get last user message content for easy reference
            user_message = None
            for m in reversed(messages):
                if m.get("role") == "user":
                    user_message = m.get("content")
                    break

            url = "https://chatgpt-42.p.rapidapi.com/chat"
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
