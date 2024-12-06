#!/bin/bash
echo "Importing data..."
mongoimport --db cryptoboard --collection article --file /docker-entrypoint-initdb.d/articles.json --jsonArray
# mongoimport --db cryptoboard --collection coin --file /docker-entrypoint-initdb.d/coins.json --jsonArray
