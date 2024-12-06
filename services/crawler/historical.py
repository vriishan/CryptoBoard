import requests, os, json
from datetime import datetime
from dateutil.relativedelta import relativedelta
from ingest import ingest_data_to_mongodb, delete_all_from_collection
coin_prices = {}
today = datetime.today()
from_date = today - relativedelta(years=2)
today = today.strftime("%Y-%m-%d")
from_date = from_date.strftime("%Y-%m-%d")
coin_prices = []
coin_map = {"BTC": "Bitcoin","ETH": "Ethereum", "DOGE": "Dogecoin"}
prices_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "historical_prices.json")
for coin in coin_map.keys():
    link = f"https://api.polygon.io/v2/aggs/ticker/X:{coin}USD/range/1/day/{from_date}/{today}?adjusted=true&sort=asc&apiKey=pwHHFstx0Dq8_gEceGc3ROCpp9LZbNb7"
    resp = requests.get(link).json()
    coin_prices.extend([{"price": x["c"], "timestamp": datetime.fromtimestamp(float(x["t"])/1000).isoformat() + 'Z', "coin": coin_map[coin]} for x in resp.get("results")])

with open(prices_file, "w") as f:
    json.dump(coin_prices, f)
    # delete_all_from_collection("coin")
    ingest_data_to_mongodb(coin_prices, "coin")
    
