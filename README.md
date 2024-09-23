# stream-mern

This is a simple project to demonstrate the ability to build a MERN stack application using docker. The project is built using React, Node.js, Express.js, MongoDB, and Docker.

## Features

- Video streaming
- User authentication
- Video uploading
- Payment processing
- Realtime messaging

## Prerequisites

- Docker
- Node.js
- pnpm
- React
- MongoDB
- Git
- Docker Compose
- Socket.io

## Run the project locally

### Install dependencies

```bash
pnpm run install
```

### Start the development server

```bash
pnpm dev
```

## Build the project for production deployment (client and server) using docker

### Build the project

```bash
pnpm run docker:build
```

### Push the project to the github container registry

```bash
pnpm run docker:push
```

### Start the project

```bash
pnpm run docker:start
```

## License

MIT
