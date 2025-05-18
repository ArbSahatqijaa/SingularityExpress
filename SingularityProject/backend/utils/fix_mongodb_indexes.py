from pymongo import MongoClient, ASCENDING
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def fix_message_indexes():
    """
    Fix MongoDB indexes for the messages collection by:
    1. Dropping the problematic message_id index if it exists
    2. Cleaning up documents with null message_id
    3. Recreating the index
    """
    try:
        # Connect to MongoDB
        mongo_config = settings.MONGO_CONFIG
        client = MongoClient(
            host=mongo_config['HOST'],
            port=mongo_config['PORT'],
            serverSelectionTimeoutMS=5000
        )
        db = client[mongo_config['DB_NAME']]
        messages = db['messages']

        # Get list of existing indexes
        existing_indexes = messages.list_indexes()
        index_names = [index['name'] for index in existing_indexes]

        # 1. Drop the problematic index if it exists
        if 'message_id_1' in index_names:
            logger.info("Dropping message_id index...")
            messages.drop_index('message_id_1')
            logger.info("Successfully dropped message_id index")
        else:
            logger.info("message_id index does not exist, skipping drop")

        # 2. Clean up documents with null message_id
        logger.info("Cleaning up documents with null message_id...")
        result = messages.delete_many({"message_id": None})
        logger.info(f"Deleted {result.deleted_count} documents with null message_id")

        # 3. Create the index if it doesn't exist
        if 'message_id_1' not in index_names:
            logger.info("Creating message_id index...")
            messages.create_index([('message_id', ASCENDING)], unique=True)
            logger.info("Successfully created message_id index")
        else:
            logger.info("message_id index already exists, skipping creation")

        return True

    except Exception as e:
        logger.error(f"Error fixing MongoDB indexes: {e}")
        return False

if __name__ == '__main__':
    # Set up logging
    logging.basicConfig(level=logging.INFO)
    
    # Run the fix
    if fix_message_indexes():
        print("Successfully fixed MongoDB indexes")
    else:
        print("Failed to fix MongoDB indexes") 