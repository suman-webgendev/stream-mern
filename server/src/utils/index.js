import { exec } from "child_process";
import colors from "colors";
import crypto from "crypto";
import dotenv from "dotenv";
import fs from "fs";
import multer from "multer";
import path from "path";
import sharp from "sharp";
import Stripe from "stripe";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

export const random = () => crypto.randomBytes(128).toString("base64");

export const authentication = (salt, password) => {
  return crypto
    .createHmac("sha256", [salt, password].join("/"))
    .update(process.env.AUTH_SECRET)
    .digest("hex");
};

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

const getTodaysDate = () => {
  const date = new Date();
  return date.toISOString().split("T")[0];
};

const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFilePath = path.join(logsDir, `${getTodaysDate()}.log`);

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

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

/**
 * Description
 * @param {number | string} amt
 * @returns {"basic" | "standard" | "premium" | "free"}
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
