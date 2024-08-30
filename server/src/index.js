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
import router from "./router/index.js";
import { logger } from "./utils/index.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 8080;

app.use(
  cors({
    credentials: true,
    origin: [process.env.CLIENT_URL, process.env.SERVER_URL],
  })
);

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const server = http.createServer(app);
const io = new Server(server);

mongoose.Promise = Promise;
mongoose.connect(process.env.DATABASE_URL);

const chatNamespace = io.of("/chat");

chatNamespace.on("connection", (socket) => {
  logger.success("a user connected");
});

mongoose.connection.on("error", (error) => {
  logger.error("Database connection error:", error);
});

mongoose.connection.once("connected", () => {
  logger.success("Database connected");
});

app.use("/", router());

server.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`);
});
