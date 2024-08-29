import bodyParser from "body-parser";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import http from "http";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import router from "./router/index.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 8080;

app.use(
  cors({
    credentials: true,
    origin: [process.env.CLIENT_URL],
  })
);

app.use(
  session({
    secret: process.env.AUTH_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const server = http.createServer(app);

mongoose.Promise = Promise;
mongoose.connect(process.env.DATABASE_URL);

mongoose.connection.on("error", (error) => {
  console.error("Database connection error:", error);
});

mongoose.connection.once("connected", () => {
  console.log("Database connected");
});

app.use("/", router());

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
