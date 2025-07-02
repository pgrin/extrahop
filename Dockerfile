# Use the official Node.js 20.12.2 image
FROM node:20.12.2

# Set working directory
WORKDIR /app

# Install tini for graceful shutdown
RUN apt-get update && apt-get install -y tini

# Set tini as entrypoint for graceful shutdown
ENTRYPOINT ["/usr/bin/tini", "--"]

# Copy package.json and yarn.lock first (better Docker caching)
COPY package.json yarn.lock ./

# Install all dependencies
RUN yarn install

# Copy the rest of the application files
COPY . .

# If you need to compile TypeScript, add this step:
RUN yarn build

# Expose the proxy port
EXPOSE 3000

# Expose the backend port
EXPOSE 3001

# Start the proxy and backend
CMD ["yarn", "start"]
