import json
from textblob import TextBlob
#pip install textblob

coin_list    = ["Bitcoin", "Ethereum", "Dogecoin"]#, "ETH", "BNB", "ADA"]
coin_text = {}

def read_json_file(file_path):
    """Reads a JSON file and returns the data as a Python object."""

    with open(file_path, 'r') as file:
        data = json.load(file)
    return data

if __name__ == '__main__':
    file_path = 'data/sample_rss_articles.json'  # Replace with your JSON file path ../services/crawler/

    #initialize dict
    for coin in coin_list:
        coin_text[coin] = []

    data = read_json_file(file_path)
    for entry in data:
        if entry["coin"] in coin_list:
            coin_text[entry["coin"]].append(entry["summary"])

    print("========================================")
    # f = open("data/sentiment_analysis.json", "w") #../services/crawler/

    sentiment_data = []

    for coin in coin_list:
        for text in coin_text[coin]:
            article_sentiment = 0
            article_subjectivity = 0
            articles = 0
            blob = TextBlob(text)
            sentiment = blob.sentiment
            #print(f"Text: {text}")
            #print(f"  Polarity: {sentiment.polarity} (Range: -1 to 1)")
            #print(f"  Subjectivity: {sentiment.subjectivity} (Range: 0 to 1)")
            article_sentiment    += sentiment.polarity
            article_subjectivity += sentiment.subjectivity
            articles += 1
            #print()
        
        coin_data = {
            "AvgSentiment": str(article_sentiment/articles),
            "AvgSubjectivity": str(article_subjectivity/articles),
            "coin": coin
        }
        sentiment_data.append(coin_data)

        print("Avg Sentiment   : " + str(article_sentiment/articles))
        print("Avg Subjectivity: " + str(article_subjectivity/articles))
        print("coin: " + coin)
        print("========================================")

        # f.write("Avg Sentiment   : " + str(article_sentiment/articles) + "\n")
        # f.write("Avg Subjectivity: " + str(article_subjectivity/articles) + "\n")
        # f.write("coin: " + coin + "\n")

    with open("data/sentiment_analysis.json", "w") as f:
        json.dump(sentiment_data, f)
