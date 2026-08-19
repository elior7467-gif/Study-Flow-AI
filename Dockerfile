FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Production image
FROM node:22-alpine AS runner

WORKDIR /app

# Copy production artifacts and package files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Set environment to production
ENV NODE_ENV=production

# Expose port (default 3000)
EXPOSE 3000

# Start server
CMD ["npm", "start"]
