from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_ai_response(request):
    """
    Store AI response from OpenRouter in MongoDB.
    The frontend now handles getting the AI response directly from OpenRouter.
    This endpoint only stores the conversation in MongoDB.
    """
    try:
        # Extract data from request
        user_message = request.data.get('message')
        ai_response = request.data.get('answer')
        conversation_history = request.data.get('conversation_history', [])
        model_used = request.data.get('model_used', 'unknown')
        
        # Validate required fields
        if not user_message or not ai_response:
            return Response({'error': 'Both message and answer are required'}, status=400)

        # Store the conversation in MongoDB
        try:
            logger.info("Attempting to connect to MongoDB...")
            db_handle, mongo_client = get_db_handle()
            logger.info(f"MongoDB connection established. Database: {db_handle.name}")
            
            # Verify MongoDB connection is live with a ping
            mongo_client.admin.command('ping')
            
            ai_qa_collection = db_handle["ai_questions_and_answers"]
            logger.info("Got reference to ai_questions_and_answers collection")
            
            # Create document to store
            qa_document = {
                "question": user_message,
                "answer": ai_response,
                "user_id": str(request.user.user_id),
                "timestamp": datetime.utcnow(),
                "model_used": model_used,
                "conversation_history": conversation_history
            }
            
            logger.info(f"Preparing to insert document for user {str(request.user.user_id)}")
            
            # Insert into MongoDB
            insert_result = ai_qa_collection.insert_one(qa_document)
            logger.info(f"Successfully stored AI Q&A in MongoDB with ID: {insert_result.inserted_id}")
            
            # Verify the insertion
            stored_doc = ai_qa_collection.find_one({"_id": insert_result.inserted_id})
            if stored_doc:
                logger.info("Verified document was stored successfully")
            else:
                logger.error("Document was not found after insertion!")
                return Response({
                    'status': 'error',
                    'error': "Document was not found after insertion"
                }, status=500)
            
            return Response({
                'status': 'success',
                'message': 'Conversation stored successfully in MongoDB'
            })
            
        except Exception as db_error:
            error_message = str(db_error)
            logger.error(f"Error storing in MongoDB: {error_message}")
            logger.error(f"Full traceback: {traceback.format_exc()}")
            
            # Return more specific error messages
            if "Connection refused" in error_message:
                return Response({
                    'status': 'error',
                    'error': "Could not connect to MongoDB server. Is it running?",
                    'details': error_message
                }, status=503)  # Service Unavailable
            elif "Authentication failed" in error_message:
                return Response({
                    'status': 'error',
                    'error': "MongoDB authentication failed. Check credentials.",
                    'details': error_message
                }, status=401)  # Unauthorized
            else:
                return Response({
                    'status': 'error',
                    'error': f"MongoDB error: {error_message}"
                }, status=500)
    except Exception as e:
        logger.error(f"Unexpected error in get_ai_response: {str(e)}")
        logger.error(f"Full traceback: {traceback.format_exc()}")
        return Response({
            'status': 'error',
            'error': f"Unexpected error: {str(e)}"
        }, status=500) 