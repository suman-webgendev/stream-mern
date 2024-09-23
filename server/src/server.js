import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import mongoose from "mongoose";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { db } from "./db/index.js";
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
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Range"],
  })
);

app.options(
  "*",
  cors({
    credentials: true,
    origin: [process.env.CLIENT_URL, process.env.SERVER_URL],
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Range"],
  })
);

app.use(
  "/api/subscriptions/webhook",
  express.raw({ type: "application/json" })
);

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static("public"));

const server = http.createServer(app);

// MongoDB connection
mongoose.Promise = Promise;
mongoose.connect(process.env.DATABASE_URL);

mongoose.connection.on("error", (error) => {
  logger.error("Database connection error:", error);
});

mongoose.connection.once("connected", () => {
  logger.success("Database connected");
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

// Socket.IO
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: [process.env.CLIENT_URL],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  logger.success(`Socket ${socket.id} connected`);

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (roomId) => {
    socket.join(roomId);
    logger.success("user joined room", roomId);
  });

  socket.on("new message", (newMessageReceived) => {
    let chat = newMessageReceived.chat;

    if (!chat.users) return logger.error("users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.on("image upload", async (data) => {
    const { imageData, filename, userId, chatId } = data;
    const mimeType = filename.split(".")[1];
    const finalImage = `data:image/${mimeType};base64,${imageData}`;

    try {
      let newMessage = {
        sender: userId,
        content: finalImage,
        chat: chatId,
        type: "image",
      };

      let message = await db.Message.create(newMessage);
      message = await message.populate("sender", "name");
      message = await message.populate("chat");
      message = await db.User.populate(message, {
        path: "chat.users",
        select: "name email",
      });

      await db.Chat.findByIdAndUpdate(chatId, {
        lastMessage: message,
      });

      io.to(chatId).emit("message received", message);
    } catch (error) {
      console.error("Error saving image message:", error);
    }
  });

  socket.on("typing", (roomId) => socket.in(roomId).emit("typing"));
  socket.on("stopped typing", (roomId) =>
    socket.in(roomId).emit("stopped typing")
  );

  socket.on("disconnect", () => {
    logger.warn(`Socket ${socket.id} disconnected`);
  });
});
