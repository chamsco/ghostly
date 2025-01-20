FROM node:18-alpine

# Install PostgreSQL client
RUN apk add --no-cache postgresql-client

# Set working directory
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies and NestJS CLI globally
RUN npm install -g @nestjs/cli && npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Create directory for logs and copy wait script
RUN mkdir -p /app/logs && \
    mkdir -p /scripts

# Copy and set permissions for wait script (do this before switching user)
COPY scripts/wait-for-db.sh /scripts/
RUN chmod +x /scripts/wait-for-db.sh && \
    chown -R node:node /app /scripts

# Switch to non-root user
USER node

# Define volume mount point
VOLUME ["/app/logs"]

EXPOSE 3000

# Use wait script before starting the app
CMD ["/scripts/wait-for-db.sh", "postgres", "npm", "run", "start:prod"] 