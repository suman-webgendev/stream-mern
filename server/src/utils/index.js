import { exec } from "child_process";
import crypto from "crypto";
import dotenv from "dotenv";
import fs from "fs";
import multer from "multer";
import path from "path";

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

export const generateThumbnail = (videoPath, thumbnailPath) => {
  return new Promise((resolve, reject) => {
    const command = `ffmpeg -i ${videoPath} -ss 00:00:02.000 -vframes 1 ${thumbnailPath}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("[generateThumbnail]", error);
        reject(error);
      } else {
        resolve(thumbnailPath);
      }
    });
  });
};
