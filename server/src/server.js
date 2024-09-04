import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { rateLimit } from "express-rate-limit";
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
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Range"],
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5000,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

app.use(limiter);

app.options(
  "*",
  cors({
    credentials: true,
    origin: [process.env.CLIENT_URL, process.env.SERVER_URL],
    methods: ["GET", "POST", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Range"],
  })
);

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
    origin: "*",
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
