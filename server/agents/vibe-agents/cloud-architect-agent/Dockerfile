FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN npm install --production

# Copy agent code
COPY . .

# Environment variables will be injected from Azure
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "index.js"]