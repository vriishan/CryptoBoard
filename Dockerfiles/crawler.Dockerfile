FROM python:3.9-slim

# Set environment variables to avoid prompts during installation
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY ../services/crawler/requirements.txt /app/

RUN pip install --upgrade pip && pip install -r requirements.txt

COPY ../services/crawler/ /app/

CMD ["sh", "-c", "python historical.py && while true; do python rss.py; python api_crawl.py; sleep 3600; done"]