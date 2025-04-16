from pymongo import MongoClient
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def get_db_handle(db_name=None, host=None, port=None, username=None, password=None):
    mongo_config = settings.MONGO_CONFIG
    
    # Use provided parameters or fall back to settings
    db_name = db_name or mongo_config['DB_NAME']
    host = host or mongo_config['HOST']  
    port = port or mongo_config['PORT']
    
    try:
        # Try connecting without authentication first
        logger.info(f"Attempting to connect to MongoDB at {host}:{port} without auth")
        client = MongoClient(host=host, port=port)
        # Test the connection
        client.admin.command('ping')
        logger.info("MongoDB connection successful without authentication")
    except Exception as e:
        logger.warning(f"Connection without auth failed: {e}, trying with authentication")
        try:
            # If that fails, try with authentication
            username = username or mongo_config['USERNAME']
            password = password or mongo_config['PASSWORD']
            
            client = MongoClient(
                host=host,
                port=port,
                username=username,
                password=password
            )
            # Test the connection
            client.admin.command('ping')
            logger.info("MongoDB connection successful with authentication")
        except Exception as auth_error:
            logger.error(f"MongoDB connection failed with authentication: {auth_error}")
            raise
    
    db_handle = client[db_name]
    return db_handle, client
