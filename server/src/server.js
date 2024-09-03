// import bodyParser from "body-parser";
// import compression from "compression";
// import cookieParser from "cookie-parser";
// import cors from "cors";
// import dotenv from "dotenv";
// import express from "express";
// import helmet from "helmet";
// import http from "http";
// import mongoose from "mongoose";
// import path from "path";
// import { Server } from "socket.io";
// import { fileURLToPath } from "url";
// import router from "./router/index.js";
// import { logger } from "./utils/index.js";

// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();
// const port = Number(process.env.PORT) || 8080;

// // Middleware
// app.use(
//   cors({
//     credentials: true,
//     origin: [process.env.CLIENT_URL, process.env.SERVER_URL],
//   })
// );
// app.use(helmet());
// app.use(compression());
// app.use(cookieParser());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // View engine setup
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));

// // Static files
// app.use(express.static("public"));

// const server = http.createServer(app);

// const io = new Server(server, {
//   pingTimeout: 60000,
//   cors: {
//     origin: [process.env.CLIENT_URL, process.env.SERVER_URL],
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// // MongoDB connection
// mongoose.Promise = Promise;
// mongoose.connect(process.env.DATABASE_URL);

// mongoose.connection.on("error", (error) => {
//   logger.error("Database connection error:", error);
// });

// mongoose.connection.once("connected", () => {
//   logger.success("Database connected");
// });

// const chat = io.of("/chat");

// chat.on("connection", (socket) => {
//   logger.success("a user connected");

//   // Handle joining a chat room
//   socket.on("joinChat", (chatId) => {
//     socket.join(chatId);
//     logger.info(`User joined chat: ${chatId}`);
//   });

//   // Handle sending a message
//   socket.on("sendMessage", (message) => {
//     const { chatId, content, senderId } = message;

//     // Emit the message to all users in the chat room
//     chat.to(chatId).emit("messageReceived", {
//       chatId,
//       content,
//       senderId,
//       createdAt: new Date(),
//     });

//     // You can also save the message to the database here
//   });

//   // Handle disconnect
//   socket.on("disconnect", () => {
//     logger.info("a user disconnected");
//   });
// });
// // Use routes
// app.use("/", router());

// // Global error handler (optional but recommended)
// app.use((err, req, res, next) => {
//   logger.error(err.stack);
//   res.status(500).send("Something went wrong!");
// });

// // Start server
// server.listen(port, () => {
//   logger.info(`Server running on http://localhost:${port}`);
// });

import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import http from "http";
import mongoose from "mongoose";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import router from "./router/index.js";
import { logger } from "./utils/index.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 8080;

// Middleware
app.use(
  cors({
    credentials: true,
    origin: [process.env.CLIENT_URL, process.env.SERVER_URL],
  })
);
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static("public"));

const server = http.createServer(app);

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: [process.env.CLIENT_URL, process.env.SERVER_URL],
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  },
});

// MongoDB connection
mongoose.Promise = Promise;
mongoose.connect(process.env.DATABASE_URL);

mongoose.connection.on("error", (error) => {
  logger.error("Database connection error:", error);
});

mongoose.connection.once("connected", () => {
  logger.success("Database connected");
});

io.on("connection", (socket) => {
  console.log("connected to socket");
});

// Use routes
app.use("/", router());

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start server
server.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});
