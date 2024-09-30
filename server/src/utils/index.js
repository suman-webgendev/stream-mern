import { exec } from "child_process";
import colors from "colors";
import crypto from "crypto";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import fs from "fs";
import multer from "multer";
import path from "path";
import sharp from "sharp";
import Stripe from "stripe";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const random = () => crypto.randomBytes(128).toString("base64");

/**
 * This function takes `salt` and `password` as input and returns hashed password.
 *
 * @param {string} salt - The salt value.
 * @param {string} password - The password value.
 * @returns {string} - The hashed password.
 */
export const authentication = (salt, password) => {
  return crypto
    .createHmac("sha256", [salt, password].join("/"))
    .update(process.env.AUTH_SECRET)
    .digest("hex");
};

/**
 * This function takes `req`, `file` and `cb` as input and returns the upload path.
 *
 * @param {express.Request} req - The incoming request object.
 * @param {File} file - The file object.
 * @param {Function} cb - The callback function.
 * @returns {string} - The upload path.
 */
export const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "public/videos";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

/**
 * This function takes `videoPath` and `thumbnailPath` as input.
 * It creates a thumbnail using `ffmpeg`, then optimize it using sharp.
 *
 * @param {string} videoPath - The path of the video file.
 * @param {string} thumbnailPath - The path of the thumbnail file.
 * @returns {Promise<void>}
 */
export const generateThumbnail = async (videoPath, thumbnailPath) => {
  try {
    const tempThumbnailPath = `${thumbnailPath}.temp.png`;
    await new Promise((resolve, reject) => {
      const command = `ffmpeg -i ${videoPath} -ss 00:00:02.000 -vframes 1 ${tempThumbnailPath}`;
      exec(command, (error, stdout, stderr) => {
        if (error) {
          logger.error("[generateThumbnail] FFmpeg error:", error);
          reject(error);
        } else {
          resolve();
        }
      });
    });

    await sharp(tempThumbnailPath)
      .resize(256, 128, {
        fit: "cover",
        position: "center",
      })
      .webp({ quality: 70 })
      .toFile(thumbnailPath);

    await new Promise((resolve, reject) => {
      fs.unlink(tempThumbnailPath, (err) => {
        if (err) {
          logger.error("[generateThumbnail] Error deleting temp file:", err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    return thumbnailPath;
  } catch (error) {
    logger.error("[generateThumbnail] Error:", error);
    throw error;
  }
};

/**
 * This function takes `imagePath` as input and convert the image into `base64` data and returns it.
 *
 * @param {string} imagePath - The path of the image file.
 * @returns {Promise<string>} - A Promise that resolves to the base64 data of the image.
 */
export const readImageFile = (imagePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(imagePath, (err, data) => {
      if (err) {
        logger.error("[readImageFile]", err);
        reject(err);
      } else {
        const base64Image = Buffer.from(data).toString("base64");
        resolve(`data:image/webp;base64,${base64Image}`);
      }
    });
  });
};

/**
 * This function returns the current date in the format of `YYYY-MM-DD`.
 *
 * @returns {string} - The current date in the format of `YYYY-MM-DD`.
 */
const getTodaysDate = () => {
  const date = new Date();
  return date.toISOString().split("T")[0];
};

/**
 * This function returns the path of the logs directory.
 *
 * @returns {string} - The path of the logs directory.
 */
const logsDir = path.join(__dirname, "../../logs");

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFilePath = path.join(logsDir, `${getTodaysDate()}.log`);

/**
 * This function takes `level` and `message` as input and writes the log message to the log file.
 * It also logs the message to the console.
 *
 * @param {"error" | "warn" | "info" | "success"} level
 * @param {any} message
 * @returns {Promise<void>}
 */
const writeLogToFile = async (level, message) => {
  const logMessage = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}\n`;
  try {
    await fs.promises.appendFile(logFilePath, logMessage);
  } catch (error) {
    console.error(colors.red(`Failed to write to log file: ${error.message}`));
  }
};

export const logger = {
  async error(...args) {
    const message = args.join(" ");
    console.log(colors.red(message));
    await writeLogToFile("error", message);
  },
  async warn(...args) {
    const message = args.join(" ");
    console.log(colors.yellow(message));
    await writeLogToFile("warn", message);
  },
  async info(...args) {
    const message = args.join(" ");
    console.log(colors.cyan(message));
    await writeLogToFile("info", message);
  },
  async success(...args) {
    const message = args.join(" ");
    console.log(colors.green(message));
    await writeLogToFile("success", message);
  },
};

/**
 * This is the Stripe API instance.
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

/**
 * This function takes `amt` as input and returns plan type as output.
 *
 * @param {number | string} amt - The amount of the subscription.
 * @returns {Promise<"basic" | "standard" | "premium" | "free">}
 */
export const subscriptionMap = async (amt) => {
  try {
    const [plans, prices] = await Promise.all([
      stripe.products.list(),
      stripe.prices.list(),
    ]);

    const subscriptionMap = prices.data.reduce((map, price) => {
      if (price.active) {
        const plan = plans.data.find((p) => p.id === price.product);
        if (plan) {
          const planMapping = {
            basic: plan.name.toLowerCase().includes("basic"),
            standard: plan.name.toLowerCase().includes("standard"),
            premium: plan.name.toLowerCase().includes("premium"),
          };

          const planName = Object.keys(planMapping).find(
            (key) => planMapping[key]
          );

          if (planName) {
            map[price.unit_amount] = planName;
          }
        }
      }
      return map;
    }, {});

    const matchedPlan = subscriptionMap[String(amt)] || "free";
    return matchedPlan;
  } catch (error) {
    logger.error("[Fetch_Price_and_Plans]", error.stack);
    return null;
  }
};

/**
 * Creates a rate limiter middleware.
 * @param {number} timeWindow - The time window in minutes for rate limiting. Default time window `10 min`
 * @param {number} maxTries - The maximum number of attempts allowed within the time window. Default maxTries `10`
 * @param {string} message- The message to send when rate limit is exceeded. Default message `Too many attempts, please try again later.`
 * @returns {import('express-rate-limit').RateLimitRequestHandler} The configured rate limiter middleware.
 */
export const rateLimiter = (
  timeWindow = 10,
  maxTries = 10,
  message = "Too many attempts, please try again later."
) => {
  return rateLimit({
    windowMs: timeWindow * 60 * 1000,
    max: maxTries,
    legacyHeaders: false,
    standardHeaders: "draft-7",
    message: {
      message,
      retryAfter: timeWindow,
    },
    statusCode: 429,
  });
};
