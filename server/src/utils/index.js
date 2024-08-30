import { exec } from "child_process";
import colors from "colors";
import crypto from "crypto";
import dotenv from "dotenv";
import fs from "fs";
import multer from "multer";
import path from "path";
import sharp from "sharp";

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

export const logger = {
  error(...args) {
    console.log(colors.red(...args));
  },
  warn(...args) {
    console.log(colors.yellow(...args));
  },
  info(...args) {
    console.log(colors.cyan(...args));
  },
  success(...args) {
    console.log(colors.green(...args));
  },
};
