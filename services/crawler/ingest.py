import json
import os
from datetime import datetime
from pymongo import MongoClient

# Get MongoURL from env
mongo_host = os.getenv("MONGO_HOST", "localhost")
mongo_port = os.getenv("MONGO_PORT", "27017")
mongo_db_name = os.getenv("MONGO_DB_NAME", "cryptoboard")

# Build the MongoDB URL
mongo_url = f"mongodb://{mongo_host}:{mongo_port}/"

# Set up MongoDB connection
client = MongoClient(mongo_url)
db = client[mongo_db_name]

"""
Use collection "coin" for crypto prices
Use collection "article" for articles
"""

# Ingest data to DB
def ingest_data_to_mongodb(data, collection_name):
    """
    Ingests data into MongoDB from either a JSON file or a Python list/dictionary.

    Parameters:
    - data: Can be a JSON file path, a list, or a single item dictionary.
    - collection_name(table name): The MongoDB collection where data will be inserted.
    """
    collection = db[collection_name]
    
    # Check if 'data' is a file path (string)
    if isinstance(data, str):
        try:
            with open(data, "r") as file:
                data = json.load(file)
        except Exception as e:
            print(f"Error loading JSON file: {e}")
            return

    try:

        # Convert 'timestamp' to ISODate if it's a string
        for entry in data if isinstance(data, list) else [data]:
            if 'timestamp' in entry:
                try:
                    # Convert the timestamp string to a datetime object
                    entry['timestamp'] = datetime.strptime(entry['timestamp'], "%Y-%m-%dT%H:%M:%SZ")
                except ValueError as e:
                    print(f"Error converting timestamp: {e}")
                    continue

        # Check if data is a list or dict and insert accordingly
        if isinstance(data, list):
            collection.insert_many(data)
        elif isinstance(data, dict):
            collection.insert_one(data)
        else:
            raise ValueError("Data must be a file path, list, or dictionary.")
        
        print(f"Data successfully inserted into collection {collection_name}.")
    
    except Exception as e:
        print(f"Error inserting data into MongoDB: {e}")

def delete_all_from_collection(collection_name):
    collection = db[collection_name]
    collection.delete_many({})
