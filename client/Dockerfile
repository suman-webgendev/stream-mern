
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

# Build the React app
RUN pnpm run build

# Stage 2: Serve the app with pnpm
FROM node:20-alpine

WORKDIR /app

# Install pnpm globally in the final image
RUN npm install -g pnpm

COPY --from=builder /app /app

# Ensure correct permissions for the 'app' user
RUN addgroup app && adduser -S -G app app && chown -R app:app /app

USER app

EXPOSE 3000

# Start the React app using pnpm
CMD ["pnpm", "run", "start"]
