# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package*.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Run the build script
RUN pnpm run build

# Stage 2: Production image
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

# Create a non-root user
RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Set ownership to the non-root user
RUN chown -R app:app /app

# Switch to non-root user
USER app

EXPOSE 8080

# Use node directly to run the built server file
CMD ["node", "dist/server.js"]