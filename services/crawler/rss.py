from feedparser import parse
import json
from bs4 import BeautifulSoup
import os
from ingest import ingest_data_to_mongodb

articles_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "sample_rss_articles.json")

# Mapping of RSS feed sources and their attributes
item_attr_map = {
    "https://www.coindesk.com/arc/outboundfeeds/rss/": {
        "title": "title", 
        "link": "link", 
        "timestamp": "published",
        "summary": "summary", 
        "image": ("media_content", 0, "url")
    },
    "https://cointelegraph.com/rss": {
        "title": "title", 
        "link": "link", 
        "timestamp": "published",
        "summary": {"summary": ("p", 1, "text")},
        "image": {"summary": ("img", "src")}
    },
    "https://news.bitcoin.com/feed/": {
        "title": "title", 
        "link": "link", 
        "timestamp": "published",
        "summary": "bnmedia_barker_title", 
        "image": "bnmedia_url"
    },
    "https://cryptopotato.com/feed/": {
        "title": "title",
        "link": "link", 
        "timestamp": "published",
        "summary": "summary", 
        "image": ("media_content", 0, "url")
    },
    "https://medium.com/feed/coinmonks": {
        "title": "title",
        "link": "link",
        "timestamp": "published",
        "summary": "summary",
        "image": {"summary": ("img", "src")}
    },
}

# List to store filtered articles
rss_articles = []

# Define the filter keywords
keywords = {
    "Bitcoin": ["bitcoin"],
    "Ethereum": ["ethereum", "eth"],
    "Dogecoin": ["dogecoin", "doge"],
    "Tron" : ["tron"],
    "Solana" : ["solana"]
}

from datetime import datetime

def format_timestamp(raw_timestamp):
    """
    Converts a given timestamp string into the desired ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ).
    Handles different timestamp formats and returns None if parsing fails.

    Args:
        raw_timestamp (str): The raw timestamp string.

    Returns:
        str: The formatted timestamp string or None if parsing fails.
    """
    try:
        # Try parsing the first timestamp format
        parsed_timestamp = datetime.strptime(raw_timestamp, "%a, %d %b %Y %H:%M:%S %z")
    except ValueError:
        try:
            # Try parsing the second timestamp format
            parsed_timestamp = datetime.strptime(raw_timestamp, "%a, %d %b %Y %H:%M:%S %Z")
        except ValueError:
            # Return None if neither format matches
            return None

    # Convert to the desired ISO 8601 format
    return parsed_timestamp.strftime("%Y-%m-%dT%H:%M:%SZ")

# Function to check if the article contains any of the keywords and assign one coin type
def contains_keywords(article):
    title = article.get("title", "").lower()
    summary = article.get("summary", "").lower()
    detected_coin = None
    
    # Check if any of the keywords exist in title or summary
    for coin, coin_keywords in keywords.items():
        for keyword in coin_keywords:
            if keyword in title or keyword in summary:
                detected_coin = coin
                break
        
        if detected_coin:
            # If a coin is detected, add it to the article and stop checking further
            article['coin'] = detected_coin
            return True
    
    return False

# Fetch and process the RSS feeds
for url in item_attr_map.keys():
    feed = parse(url)
    items = feed['entries']
    
    for item in items:
        attrs = item_attr_map[url]
        article = {"source": url.split("/")[2]}  # Extract source from the URL

        # Extract article data from the feed
        for key, val in attrs.items():
            if key == "timestamp":
                article[key] = format_timestamp(item[val])  # Clean up the date format
            elif isinstance(val, str):
                article[key] = item[val]
            elif val is None:
                article[key] = None
            elif isinstance(val, tuple):
                article[key] = item[val[0]][val[1]][val[2]]
            elif isinstance(val, dict):
                nested_key = list(val.keys())[0]
                nested_val = val[nested_key]
                soup = BeautifulSoup(item[nested_key], features="html.parser")
                if val[nested_key] == "text":
                    article[key] = soup.text
                elif isinstance(nested_val, tuple):
                    if nested_key == "summary":
                        if len(nested_val) == 2:
                            article["summary"] = soup.text
                        elif len(nested_val) == 3:
                            article["summary"] = soup.find_all([nested_val[0]])[nested_val[1]].text
                    # if key == "image":
                    #     article["image"] = soup.find([nested_val[0]]).get(nested_val[1])
        
        # Only add articles that contain the keywords in the title or summary
        if contains_keywords(article):
            rss_articles.append(article)

# Print the last fetched article for debugging
print(json.dumps(rss_articles[-1], indent=4))

# Save the articles to a JSON file
with open(articles_file, 'w') as f:
    json.dump(rss_articles, f)

# Optionally, you can also ingest the filtered data into MongoDB
ingest_data_to_mongodb(rss_articles, "article")

