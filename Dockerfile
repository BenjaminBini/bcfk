# Use Node.js 20 LTS as base image
FROM node:20-alpine

# Update Alpine and install security fixes
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all source files
COPY . .

# Build the Svelte frontend
RUN npm run build

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port 3001
EXPOSE 3001


# Start the application
CMD ["node", "server.js"]