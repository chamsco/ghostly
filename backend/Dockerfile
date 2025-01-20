FROM node:18-alpine

# Install PostgreSQL client
RUN apk add --no-cache postgresql-client

# Set working directory
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Create scripts directory and copy wait script
RUN mkdir -p /scripts
COPY scripts/wait-for-db.sh /scripts/
RUN chmod +x /scripts/wait-for-db.sh

# Create logs directory
RUN mkdir -p /usr/src/app/logs && \
    chown -R node:node /usr/src/app /scripts

# Switch to non-root user
USER node

EXPOSE 3000

# Use wait script before starting the app
CMD ["/scripts/wait-for-db.sh", "postgres", "npm", "run", "start:prod"] 