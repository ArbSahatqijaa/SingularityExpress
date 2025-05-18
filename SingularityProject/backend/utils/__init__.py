"""
Utils package for database and other utility functions.
"""

from pymongo import MongoClient
from django.conf import settings
import logging
from .mongodb_schemas import setup_collections

logger = logging.getLogger(__name__)

def get_db_handle(db_name=None, host=None, port=None, username=None, password=None):
    mongo_config = settings.MONGO_CONFIG
    
    # Use provided parameters or fall back to settings
    db_name = db_name or mongo_config['DB_NAME']
    host = host or mongo_config['HOST']  
    port = port or mongo_config['PORT']
    
    logger.info(f"Connecting to MongoDB: {host}:{port}, database: {db_name}")
    
    connection_error = None
    
    # First try connecting without authentication
    try:
        logger.info(f"Attempting to connect to MongoDB at {host}:{port} without auth")
        client = MongoClient(host=host, port=port, serverSelectionTimeoutMS=5000)
        # Test the connection with timeout to fail fast if server is down
        client.admin.command('ping')
        logger.info("MongoDB connection successful without authentication")
        db_handle = client[db_name]
        setup_collections(db_handle)
        return db_handle, client
    except Exception as e:
        connection_error = e
        logger.warning(f"Connection without auth failed: {e}, trying with authentication")
    
    # If no-auth connection fails, try with authentication
    try:
        username = username or mongo_config['USERNAME']
        password = password or mongo_config['PASSWORD']
        
        client = MongoClient(
            host=host,
            port=port,
            username=username,
            password=password,
            serverSelectionTimeoutMS=5000  # 5 second timeout for faster failure
        )
        # Test the connection
        client.admin.command('ping')
        logger.info("MongoDB connection successful with authentication")
        db_handle = client[db_name]
        setup_collections(db_handle)
        return db_handle, client
    except Exception as auth_error:
        logger.error(f"MongoDB connection failed with authentication: {auth_error}")
        # If both connection attempts failed, provide more context
        error_msg = f"Failed to connect to MongoDB: auth error: {auth_error}, no-auth error: {connection_error}"
        logger.error(error_msg)
        raise Exception(error_msg) from auth_error 