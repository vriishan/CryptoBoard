FROM python:3.9-slim

# Set environment variables to avoid prompts during installation
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set working directory inside the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file into the container
COPY ../services/backend/requirements.txt /app/

# Install Python dependencies
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy the Django application code into the container
COPY ../services/backend/ /app/

# Expose port 8000 for the Django server
EXPOSE 8000

# Run migrations and start the development server
CMD ["sh", "-c", "python manage.py runserver 0.0.0.0:8000"]
