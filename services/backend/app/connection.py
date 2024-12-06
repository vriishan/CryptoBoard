from pymongo import MongoClient
from app.settings import MONGO_DB_NAME
from app.settings import MONGO_HOST
from app.settings import MONGO_PORT

def get_connection(uri, db_name=None):
    """
    Get a MongoDB connection handle.

    Parameters:
    - uri (str): MongoDB connection string. Defaults to 'mongodb://localhost:27017/'.
    - db_name (str): Optional name of the database to connect to. Defaults to None.

    Returns:
    - MongoClient object if db_name is None.
    - Database object if db_name is provided.
    """
    client = MongoClient(uri)
    if db_name:
        return client[db_name]  # Return the specific database handle
    return client  # Return the client handle for more flexibility

# Optional: You can configure defaults for production or testing environments
DEFAULT_URI = f"mongodb://{MONGO_HOST}:{MONGO_PORT}/"
DEFAULT_DB = MONGO_DB_NAME

def get_db_handle():
    """Get a connection to the default database."""
    return get_connection(DEFAULT_URI, DEFAULT_DB)
