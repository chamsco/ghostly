FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies and NestJS CLI globally
RUN npm install -g @nestjs/cli && npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Verify the build output exists
RUN ls -la dist/ && test -f dist/main.js

# Set proper permissions
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Set NODE_OPTIONS to include the crypto module
ENV NODE_OPTIONS="--experimental-crypto-policy=node10"

EXPOSE 3000
CMD ["node", "dist/main.js"] 