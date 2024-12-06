# Use alpine image
FROM node:18-alpine AS build

ENV NODE_ENV=production

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json into the container
COPY ../services/frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy the entire application code into the container
COPY ../services/frontend/ ./

# Build the Vite app
RUN npm run build

# Stage 2: Serve the built app with Nginx
FROM nginx:1.27.3-alpine

# Copy the built files from the previous stage to the Nginx HTML directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 for the web server
EXPOSE 80

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]