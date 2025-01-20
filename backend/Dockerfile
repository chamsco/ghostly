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

# Create directory for logs
RUN mkdir -p /app/logs && \
    chown -R node:node /app

# Switch to non-root user
USER node

# Define volume mount point
VOLUME ["/app/logs"]

# Make wait script executable
COPY scripts/wait-for-db.sh /wait-for-db.sh
RUN chmod +x /wait-for-db.sh

EXPOSE 3000

# Use wait script before starting the app
CMD ["/wait-for-db.sh", "postgres", "npm", "run", "start:prod"] 