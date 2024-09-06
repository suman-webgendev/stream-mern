# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

# Stage 2: Production image
FROM node:20-alpine

RUN npm install -g pnpm

RUN addgroup app && adduser -S -G app app

WORKDIR /app

COPY --from=builder /app /app

RUN chown -R app:app /app

USER app

EXPOSE 8080

CMD ["pnpm", "run", "start"]