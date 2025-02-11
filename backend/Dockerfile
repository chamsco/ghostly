# Build stage
FROM node:20-alpine AS builder

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

# Production stage
FROM node:20-alpine

# Install PostgreSQL client
RUN apk add --no-cache postgresql-client

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies including development dependencies for migrations
RUN npm install

# Copy built application, migrations, and scripts from builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/src/migrations ./src/migrations
COPY scripts/ /scripts/
RUN chmod +x /scripts/wait-for-db.sh /scripts/start.sh

# Create logs directory
RUN mkdir -p /usr/src/app/logs && \
    chown -R node:node /usr/src/app /scripts

# Switch to non-root user
USER node

EXPOSE 3000

# Use wait script before starting the app
CMD ["/scripts/wait-for-db.sh", "postgres", "/scripts/start.sh"] 