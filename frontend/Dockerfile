FROM node:20-alpine

WORKDIR /app

# Install dependencies first (as root)
COPY package.json package-lock.json* ./
RUN npm install

# Copy source files
COPY . .

# Set ownership to node user (uid 1000) - matches typical host user
RUN chown -R 1000:1000 /app

EXPOSE 5173

CMD ["npm", "run", "dev"]
