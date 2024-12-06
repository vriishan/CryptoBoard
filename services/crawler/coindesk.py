import requests
import json
import os
import time
from datetime import datetime, timezone
from bs4 import BeautifulSoup
from ingest import ingest_data_to_mongodb

# Base URL of Coindesk
BASE_URL = "https://www.coindesk.com"

# Directory to save data
DATA_DIR = "./data"
os.makedirs(DATA_DIR, exist_ok=True)


def format_timestamp_to_string(timestamp):
    """
    Converts a timestamp to a string in the format '%Y-%m-%dT%H:%M:%SZ'.

    Parameters:
        timestamp (str or datetime): The input timestamp. Can be an ISO 8601 string or a datetime object.

    Returns:
        str: The formatted timestamp as a string in UTC.
    """
    if isinstance(timestamp, str):
        # Parse the string as an ISO 8601 datetime
        parsed_timestamp = datetime.fromisoformat(timestamp)
    elif isinstance(timestamp, datetime):
        # Use the datetime object directly
        parsed_timestamp = timestamp
    else:
        raise ValueError("Timestamp must be a string or datetime object.")

    # Convert to UTC and format as a string
    return parsed_timestamp.astimezone(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
def fetch_crypto_data():
    """Fetch cryptocurrency prices and related data."""
    currencies = ["Bitcoin", "Ethereum", "Dogecoin"]
    crypto_data_list = []

    for currency in currencies:
        print(f"Fetching data for {currency.capitalize()}...")
        url = f"https://www.coindesk.com/price/{currency}"
        data = fetch_data_from_url(url, currency.capitalize())
        if data:
            crypto_data_list.append(data)

    return crypto_data_list


def fetch_data_from_url(url, crypto_name):
    """Fetch data for a cryptocurrency."""
    try:
        response = requests.get(url)
        if response.status_code != 200:
            print(f"Failed to retrieve the page for {crypto_name}. Status code: {response.status_code}")
            return None

        soup = BeautifulSoup(response.content, "html.parser")
        data = extract_data_from_page(soup, crypto_name)

        if data:
            #data["timestamp"] = datetime.now(timezone.utc).replace(microsecond=0).isoformat()
            data["timestamp"] = format_timestamp_to_string(datetime.now(timezone.utc).replace(microsecond=0).isoformat())

        return data
    except Exception as e:
        print(f"Error fetching data for {crypto_name}: {e}")
        return None

def extract_data_from_page(soup, crypto_name):
    """Extract relevant cryptocurrency data from the HTML for a specific crypto."""
    data = {"coin": crypto_name}
    # Extract 24 Hour High
    high_value = soup.find("span", string="24 Hour High")
    if high_value:
        high_value = high_value.find_next("span")
        if high_value:
            data["24HourHigh"] = high_value.get_text(strip=True)
            percent_change = high_value.find_next("span", class_="text-color-red")  # Look for the percentage
            if percent_change:
                data["24HourHighChange"] = percent_change.get_text(strip=True)
    
    # Extract 24 Hour Low
    low_value = soup.find("span", string="24 Hour Low")
    if low_value:
        low_value = low_value.find_next("span")
        if low_value:
            data["24HourLow"] = low_value.get_text(strip=True)
            percent_change = low_value.find_next("span", class_="text-color-dark-green")  # Look for the percentage
            if percent_change:
                data["24HourLowChange"] = percent_change.get_text(strip=True)
    
    # Extract Market Cap
    market_cap = soup.find("span", string="Market Cap")
    if market_cap:
        market_cap = market_cap.find_next("span")
        if market_cap:
            data["MarketCap"] = market_cap.get_text(strip=True)
    
    # Extract Fully Diluted Valuation
    fdv = soup.find("span", string="Fully Diluted Valuation")
    if fdv:
        fdv = fdv.find_next("span")
        if fdv:
            data["FullyDilutedValuation"] = fdv.get_text(strip=True)
    
    # Extract 24 Hour Trading Volume
    volume = soup.find("span", string="24 Hour Trading Volume")
    if volume:
        volume = volume.find_next("span")
        if volume:
            data["24HourTradingVolume"] = volume.get_text(strip=True)
    
    # Extract Circulating Supply
    circulating_supply = soup.find("span", string="Circulating Supply")
    if circulating_supply:
        circulating_supply = circulating_supply.find_next("span")
        if circulating_supply:
            data["CirculatingSupply"] = circulating_supply.get_text(strip=True)
    
    # Extract Total Supply
    total_supply = soup.find("span", string="Total Supply")
    if total_supply:
        total_supply = total_supply.find_next("span")
        if total_supply:
            data["TotalSupply"] = total_supply.get_text(strip=True)
    
    # Extract Max Supply
    max_supply = soup.find("span", string="Max Supply")
    if max_supply:
        max_supply = max_supply.find_next("span")
        if max_supply:
            data["MaxSupply"] = max_supply.get_text(strip=True)
    
    return data

def fetch_articles_with_keywords(keywords, min_articles_per_keyword=5, max_links_to_check=50):
    """
    Fetch articles containing specific keywords, attempting at least a minimum number per keyword,
    while stopping after processing a maximum number of links.
    """
    print("Fetching articles from Coindesk...")

    # Send HTTP request to Coindesk homepage
    response = requests.get(BASE_URL)
    if response.status_code != 200:
        print(f"Failed to retrieve the Coindesk homepage. Status code: {response.status_code}")
        return []

    # Parse the homepage HTML
    soup = BeautifulSoup(response.content, "html.parser")

    # Find all article links on the page
    links = soup.find_all("a", href=True)

    # Initialize counters and results
    filtered_articles = []
    keyword_count = {keyword: 0 for keyword in keywords}
    links_checked = 0

    for link in links:
        # Stop processing after reaching the max links limit
        if links_checked >= max_links_to_check:
            print("Reached maximum link check limit.")
            break

        href = link['href']
        # Ensure we get full URLs for relative links
        article_url = href if href.startswith("http") else BASE_URL + href

        # Skip non-article URLs or duplicates
        if any(skip in article_url for skip in ["/price/", "/video/", "/sponsored-content/", "/advertise/"]):
            continue

        # Fetch and parse the article content
        article_data = fetch_article_content(article_url, keywords)
        links_checked += 1  # Count the link as checked

        if article_data:
            keyword_matched = article_data["coin"]

            # Add only if the minimum threshold for the keyword isn't reached
            if keyword_count[keyword_matched] < min_articles_per_keyword:
                filtered_articles.append(article_data)
                keyword_count[keyword_matched] += 1

        # Check if the threshold has been met for all keywords
        if all(count >= min_articles_per_keyword for count in keyword_count.values()):
            print("Threshold met for all keywords.")
            break

    print(f"Articles found per keyword: {keyword_count}")
    return filtered_articles



def fetch_article_content(url, keywords):
    """Fetch and parse the content of an article."""
    try:
        #print(f"Checking article: {url}")
        response = requests.get(url)
        if response.status_code != 200:
            print(f"Failed to retrieve the article. Status code: {response.status_code}")
            return None

        soup = BeautifulSoup(response.content, "html.parser")
        title = soup.find("h1")
        title_text = title.get_text(strip=True) if title else "No Title"

        body = soup.find_all("p")
        body_text = " ".join([p.get_text(strip=True) for p in body])

        for keyword in keywords:
            if keyword.lower() in (title_text + body_text).lower():
                return {
                    "url": url,
                    "title": title_text,
                    "content_snippet": body_text,
                    "coin": keyword.capitalize(),
                    "timestamp":format_timestamp_to_string(datetime.now(timezone.utc).replace(microsecond=0).isoformat())
                }
    except Exception as e:
        print(f"Error fetching article content: {e}")
        return None


def save_data(data, filename):
    """Save data to a JSON file."""
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

    print(f"Saved data to {filepath}")


def main():
    keywords = ["Bitcoin", "Ethereum", "Dogecoin"]
    max_articles = 50

    while True:
        print("Starting data fetch cycle...")

        # Fetch cryptocurrency data
        crypto_data = fetch_crypto_data()
        if crypto_data:
            save_data(crypto_data, "crypto_prices.json")
            ingest_data_to_mongodb(crypto_data,"coin")

        # Fetch articles with keywords
        articles = fetch_articles_with_keywords(keywords,5, max_articles)
        if articles:
            save_data(articles, "filtered_articles.json")
            ingest_data_to_mongodb(articles,"article")

        print("Cycle complete. Waiting for the next cycle...")
        print("Run sentiment analysis")
        os.system("python json_parser_for_sentiment.py")
        time.sleep(3600)  # Wait for 1 hour


if __name__ == "__main__":
    main()

