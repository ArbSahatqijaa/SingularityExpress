from pymongo import MongoClient, ASCENDING, DESCENDING
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

def setup_collections(db_handle):
    """Set up MongoDB collections with proper indexes and validation."""
    try:
        # AI Questions and Answers collection schema
        ai_qa_validator = {
            '$jsonSchema': {
                'bsonType': 'object',
                'required': ['question', 'answer', 'user_id', 'timestamp', 'model_used'],
                'properties': {
                    'question': {'bsonType': 'string'},
                    'answer': {'bsonType': 'string'},
                    'user_id': {'bsonType': 'string'},
                    'timestamp': {'bsonType': 'date'},
                    'model_used': {'bsonType': 'string'},
                    'conversation_history': {
                        'bsonType': 'array',
                        'items': {
                            'bsonType': 'object',
                            'properties': {
                                'user': {'bsonType': 'string'},
                                'text': {'bsonType': 'string'}
                            }
                        }
                    }
                }
            }
        }

        # Messages collection schema
        messages_validator = {
            '$jsonSchema': {
                'bsonType': 'object',
                'required': ['conversation_id', 'sender_id', 'recipient_id', 'content', 'message_type', 'timestamp', 'status', 'message_id'],
                'properties': {
                    'conversation_id': {'bsonType': 'string'},
                    'sender_id': {'bsonType': 'int'},
                    'recipient_id': {'bsonType': 'int'},
                    'content': {
                        'oneOf': [
                            {'bsonType': 'string'},
                            {
                                'bsonType': 'object',
                                'required': ['url', 'filename', 'file_type', 'size'],
                                'properties': {
                                    'url': {'bsonType': 'string'},
                                    'filename': {'bsonType': 'string'},
                                    'file_type': {'bsonType': 'string'},
                                    'size': {'bsonType': 'int'},
                                    'stored_filename': {'bsonType': 'string'}
                                }
                            }
                        ]
                    },
                    'message_type': {
                        'enum': ['text', 'image', 'file']
                    },
                    'timestamp': {'bsonType': 'string'},
                    'status': {
                        'enum': ['sending', 'sent', 'delivered', 'error']
                    },
                    'message_id': {'bsonType': 'string'},
                    'created_at': {'bsonType': 'date'},
                    'updated_at': {'bsonType': 'date'}
                }
            }
        }

        # Video calls collection schema
        video_calls_validator = {
            '$jsonSchema': {
                'bsonType': 'object',
                'required': ['caller_id', 'callee_id', 'start_time', 'status'],
                'properties': {
                    'caller_id': {'bsonType': 'int'},
                    'callee_id': {'bsonType': 'int'},
                    'start_time': {'bsonType': 'date'},
                    'end_time': {'bsonType': 'date'},
                    'status': {
                        'enum': ['active', 'connected', 'ended', 'declined']
                    },
                    'updated_at': {'bsonType': 'date'},
                    'duration': {'bsonType': 'int'},  # Duration in seconds
                    'call_quality': {
                        'bsonType': 'object',
                        'properties': {
                            'video_quality': {'bsonType': 'string'},
                            'audio_quality': {'bsonType': 'string'},
                            'network_quality': {'bsonType': 'string'}
                        }
                    }
                }
            }
        }

        # Create or update ai_questions_and_answers collection
        if 'ai_questions_and_answers' not in db_handle.list_collection_names():
            db_handle.create_collection('ai_questions_and_answers', validator=ai_qa_validator)
            logger.info("Created ai_questions_and_answers collection with schema validation")
        else:
            db_handle.command('collMod', 'ai_questions_and_answers', validator=ai_qa_validator)
            logger.info("Updated ai_questions_and_answers collection schema validation")

        # Create or update messages collection
        if 'messages' not in db_handle.list_collection_names():
            db_handle.create_collection('messages', validator=messages_validator)
            logger.info("Created messages collection with schema validation")
        else:
            db_handle.command('collMod', 'messages', validator=messages_validator)
            logger.info("Updated messages collection schema validation")

        # Create or update video_calls collection
        if 'video_calls' not in db_handle.list_collection_names():
            db_handle.create_collection('video_calls', validator=video_calls_validator)
            logger.info("Created video_calls collection with schema validation")
        else:
            db_handle.command('collMod', 'video_calls', validator=video_calls_validator)
            logger.info("Updated video_calls collection schema validation")

        # Create indexes
        messages = db_handle['messages']
        video_calls = db_handle['video_calls']
        ai_qa = db_handle['ai_questions_and_answers']

        # AI Q&A indexes
        ai_qa.create_index([('user_id', ASCENDING)])
        ai_qa.create_index([('timestamp', DESCENDING)])
        ai_qa.create_index([('user_id', ASCENDING), ('timestamp', DESCENDING)])

        # Messages indexes
        messages.create_index([('conversation_id', ASCENDING), ('timestamp', ASCENDING)])
        messages.create_index([('message_id', ASCENDING)], unique=True)
        messages.create_index([('sender_id', ASCENDING), ('recipient_id', ASCENDING)])
        messages.create_index([('status', ASCENDING)])

        # Video calls indexes
        video_calls.create_index([('caller_id', ASCENDING), ('callee_id', ASCENDING)])
        video_calls.create_index([('status', ASCENDING)])
        video_calls.create_index([('start_time', DESCENDING)])
        video_calls.create_index([
            ('caller_id', ASCENDING),
            ('callee_id', ASCENDING),
            ('status', ASCENDING),
            ('start_time', DESCENDING)
        ])

        logger.info("Successfully set up MongoDB collections and indexes")
        return True

    except Exception as e:
        logger.error(f"Error setting up MongoDB collections: {e}", exc_info=True)
        return False

def calculate_call_duration(start_time, end_time=None):
    """Calculate call duration in seconds."""
    if not end_time:
        end_time = datetime.utcnow()
    duration = (end_time - start_time).total_seconds()
    return int(duration) 