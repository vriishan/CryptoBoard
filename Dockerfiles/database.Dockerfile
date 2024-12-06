# Dockerfile
FROM mongo:latest

# Create the folder for initialization scripts
RUN mkdir -p /docker-entrypoint-initdb.d

# Install dos2unix to ensure proper Unix line endings
RUN apt-get update && apt-get install -y dos2unix

# Copy data files and init scripts
COPY ../services/database/articles.json /docker-entrypoint-initdb.d/articles.json
# COPY ../services/database/coins.json /docker-entrypoint-initdb.d/coins.json
COPY ../services/database/init-mongo.js /docker-entrypoint-initdb.d/init-mongo.js
COPY ../services/database/import-data.sh /docker-entrypoint-initdb.d/import-data.sh

RUN dos2unix /docker-entrypoint-initdb.d/import-data.sh && \
    chmod +x /docker-entrypoint-initdb.d/import-data.sh

# Expose MongoDB port
EXPOSE 27017