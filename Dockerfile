# Use a single-stage build for simplicity and clarity
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package management files and install all dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the application
# The `build` script in package.json should handle both client and server builds
RUN npm run build

# Verify build output exists
RUN ls -la dist/ && ls -la dist/public/ || echo "Frontend build missing"

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=80

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application and production dependencies
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Switch to the non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE 80

# Add a healthcheck to verify the server is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]
