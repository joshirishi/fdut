

# Use Node.js image
FROM node:14

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy server.js
COPY server.js .

# Copy the public folder
COPY public/ public/

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
