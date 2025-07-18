# Use Node.js 20 LTS as base image
FROM node:20-bullseye

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

# Expose port 3001
EXPOSE 3001


# Start the application
CMD ["node", "server.js"]