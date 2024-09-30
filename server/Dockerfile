# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package and lock files
COPY package*.json pnpm-lock.yaml ./

# Install pnpm globally and dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy all project files
COPY . .

# Stage 2: Production image
FROM node:20-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Create a non-root user
RUN addgroup app && adduser -S -G app app

WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app /app

# Change ownership of the application files
RUN chown -R app:app /app

# Switch to the non-root user
USER app

# Expose the application port
EXPOSE 8080

# Start the application
CMD ["pnpm", "run", "start"]
