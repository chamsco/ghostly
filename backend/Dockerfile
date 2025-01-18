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

# Set proper permissions
RUN chown -R node:node /app

# Switch to non-root user
USER node

EXPOSE 3000
CMD ["npm", "run", "start:prod"] 