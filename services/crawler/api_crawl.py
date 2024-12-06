import requests
import json
import os
from ingest import ingest_data_to_mongodb, delete_all_from_collection
import time
from datetime import datetime, timezone

# CoinMarketCap API URL and your API Key
API_KEY = "64c7fdc0-1fd4-44cf-add0-f9cd8eb103d4"  # Replace with your actual CoinMarketCap API key
API_URL = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest"

# Define headers for the request
headers = {
    'Accepts': 'application/json',
    'X-CMC_PRO_API_KEY': API_KEY,  # Add your API key here
    'Content-Type': 'application/json',
}

# Define parameters for the request (Optional)
params = {
    'start': '1',  # Starting cryptocurrency ID (1 for Bitcoin)
    'limit': '10',  # Limit the number of results (10 for top 10)
    'convert': 'USD'  # Convert to USD
}

# Coins of interest (Bitcoin, Ethereum, Dogecoin, Tron, Solana)
coins_of_interest = ['bitcoin', 'ethereum', 'dogecoin', 'tron', 'solana']
DATA_DIR = "./data"
os.makedirs(DATA_DIR, exist_ok=True)

def format_timestamp_to_string2(timestamp):
    """
    Converts a timestamp to a string in the format '%Y-%m-%dT%H:%M:%SZ'.

    Parameters:
        timestamp (str or datetime): The input timestamp. 
                                     Can be an ISO 8601 string (with or without 'Z') or a datetime object.
    
    Returns:
        str: The formatted timestamp as a string in UTC.
    
    Raises:
        ValueError: If the input timestamp is not a valid ISO 8601 string or datetime object.
    """
    if isinstance(timestamp, str):
        try:
            # Handle ISO 8601 string (with 'Z' or offset)
            if timestamp.endswith("Z"):
                # Remove the 'Z' and parse as UTC
                parsed_timestamp = datetime.fromisoformat(timestamp[:-1]).replace(tzinfo=timezone.utc)
            else:
                # Parse with offset (e.g., "+00:00")
                parsed_timestamp = datetime.fromisoformat(timestamp)
        except ValueError:
            raise ValueError("Invalid timestamp format. Ensure it's a valid ISO 8601 string.")
    elif isinstance(timestamp, datetime):
        parsed_timestamp = timestamp
    else:
        raise ValueError("Timestamp must be a string or datetime object.")

    # Convert to UTC and format as a string
    return parsed_timestamp.astimezone(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')

def fetch_cryptocurrency_data():
    """Fetch cryptocurrency data like 24-hour high, low, and other metrics."""
    try:
        # Send the request to CoinMarketCap API
        response = requests.get(API_URL, headers=headers, params=params)
        
        if response.status_code == 200:
            data = response.json()
            #print(data)
            return parse_data(data)
        else:
            print(f"Error: Failed to fetch data. Status code: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error fetching cryptocurrency data: {e}")
        return None

def parse_data(data):
    """Parse and extract relevant information from the API response."""
    parsed_data = []
    
    # Loop through the cryptocurrencies in the response
    for crypto in data["data"]:
        # Normalize the coin name to lowercase for comparison
        coin_name_normalized = crypto["name"].lower()
        
        if coin_name_normalized in coins_of_interest:
            # Check for 'circulating_supply' and handle missing value
            circulating_supply = crypto["quote"]["USD"].get("circulating_supply", "N/A")
            
            coin_data = {
                "coin": crypto["name"],
                "symbol": crypto["symbol"],
                "percent_change_24h": crypto["quote"]["USD"]["percent_change_24h"],
                "price": crypto["quote"]["USD"]["price"],
                "fully_diluted_market_cap": crypto["quote"]["USD"]["fully_diluted_market_cap"],
                "circulating_supply": circulating_supply,
                "total_supply": crypto["quote"]["USD"].get("total_supply", "N/A"),
                "24_hour_volume": crypto["quote"]["USD"]["volume_24h"],
                "volume_change_24h": crypto["quote"]["USD"]["volume_change_24h"],
                "timestamp": format_timestamp_to_string2(crypto["last_updated"])
            }
            parsed_data.append(coin_data)
    
    return parsed_data

def save_data(data, filename):
    """Save the fetched data to a JSON file."""
    if not data:
        print(f"No data to save for {filename}.")
        return
    filepath = os.path.join(DATA_DIR, filename)
    if os.path.exists(filepath):
        with open(filepath, "r") as f:
            existing_data = json.load(f)
    else:
        existing_data = []
    existing_data.extend(data if isinstance(data, list) else [data])

    with open(filepath, "w") as f:
        json.dump(existing_data, f, indent=4)

    print(f"Saved data to {filename}")
    

if __name__ == "__main__":
    # Fetch cryptocurrency data
    crypto_data = fetch_cryptocurrency_data()
    if crypto_data:
        print("Fetched cryptocurrency data:")

        #print(json.dumps(crypto_data, indent=4))

        # Save the data to a file
        save_data(crypto_data, "crypto_data_api.json")
        ingest_data_to_mongodb(crypto_data,"coin")

        print("Cycle complete. Waiting for the next cycle...")
        print("Run sentiment analysis")
        os.system("python json_parser_for_sentiment.py")
        with open("data/sentiment_analysis.json") as f:
            sentiment =  json.load(f)
            if sentiment:
                delete_all_from_collection("sentiment")
                ingest_data_to_mongodb(sentiment,"sentiment")

