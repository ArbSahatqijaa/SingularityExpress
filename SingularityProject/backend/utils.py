# utils.py

from pymongo import MongoClient

def get_db_handle(db_name, host, port, username, password):
    """
    Creates a MongoDB client and returns a reference to the specified database.
    This utility function helps keep MongoDB connection logic centralized and reusable.
    """
    client = MongoClient(
        host=host,
        port=int(port),
        username=username,
        password=password
    )
    db_handle = client[db_name]
    return db_handle, client
