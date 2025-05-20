from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import serializers
from django.conf import settings
from openai import OpenAI
import logging
from datetime import datetime
from utils import get_db_handle
import traceback
from bson import ObjectId

logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=settings.OPENAI_API_KEY)


class AIResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    answer = serializers.CharField()
    conversation_history = serializers.ListField(required=False)
    model_used = serializers.CharField(required=False, default='unknown')


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

        ai_qa_collection = db_handle["ai_questions_and_answers"]

        test_doc = {
            "question": "Test question",
            "answer": "Test answer",
            "user_id": str(request.user.user_id),
            "timestamp": datetime.utcnow(),
            "model_used": "test",
            "conversation_history": []
        }

        insert_result = ai_qa_collection.insert_one(test_doc)
        logger.info("Test document inserted.")

        stored_doc = ai_qa_collection.find_one({"_id": insert_result.inserted_id})
        if stored_doc:
            stored_doc['_id'] = str(stored_doc['_id'])
            stored_doc['timestamp'] = stored_doc['timestamp'].isoformat()

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
        logger.error("MongoDB test failed", exc_info=True)
        return Response({
            'status': 'error',
            'message': f'MongoDB test failed: {str(e)}'
        }, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_ai_response(request):
    """
    Store AI response from frontend in MongoDB.
    The frontend gets the AI response directly from OpenRouter.
    """
    try:
        serializer = AIResponseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        db_handle, mongo_client = get_db_handle()
        mongo_client.admin.command('ping')
        ai_qa_collection = db_handle["ai_questions_and_answers"]

        qa_document = {
            "question": data["message"],
            "answer": data["answer"],
            "user_id": str(request.user.user_id),
            "timestamp": datetime.utcnow(),
            "model_used": data.get("model_used", "unknown"),
            "conversation_history": data.get("conversation_history", [])
        }

        logger.info("Storing AI conversation in MongoDB...")
        insert_result = ai_qa_collection.insert_one(qa_document)

        stored_doc = ai_qa_collection.find_one({"_id": insert_result.inserted_id})
        if not stored_doc:
            logger.error("Document not found after insertion.")
            return Response({
                'status': 'error',
                'error': "Document was not found after insertion"
            }, status=500)

        return Response({
            'status': 'success',
            'message': 'Conversation stored successfully in MongoDB',
            'inserted_id': str(insert_result.inserted_id)
        })

    except serializers.ValidationError as ve:
        return Response({'status': 'error', 'error': ve.detail}, status=400)

    except Exception as e:
        logger.error("Error in get_ai_response", exc_info=True)
        error_message = str(e)

        if "Connection refused" in error_message:
            return Response({
                'status': 'error',
                'error': "Could not connect to MongoDB server. Is it running?",
                'details': error_message
            }, status=503)

        elif "Authentication failed" in error_message:
            return Response({
                'status': 'error',
                'error': "MongoDB authentication failed. Check credentials.",
                'details': error_message
            }, status=401)

        else:
            return Response({
                'status': 'error',
                'error': f"MongoDB error: {error_message}"
            }, status=500)
