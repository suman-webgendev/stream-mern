import fs from "fs";
import mongoose from "mongoose";
import multer from "multer";
import { promisify } from "util";
import { createVideo, getVideoById, getVideos } from "../actions/videos.js";
import {
  generateThumbnail,
  logger,
  readImageFile,
  storage,
} from "../utils/index.js";

const upload = multer({
  storage: storage,
  limits: 100 * 1024 * 1024,
});

export const uploadVideo = async (req, res) => {
  const uploadSingle = promisify(upload.single("video"));

  try {
    await uploadSingle(req, res);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded!" });
    }

    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required!" });
    }

    const videoPath = req.file.path;
    const thumbnailPath = `public/thumbnails/${Date.now()}_thumbnail.webp`;

    await generateThumbnail(videoPath, thumbnailPath);

    const videoData = {
      title,
      path: videoPath,
      imageUrl: thumbnailPath,
    };

    const savedVideo = await createVideo(videoData);

    return res.status(201).json({
      message: "Video uploaded and saved successfully!",
      video: savedVideo,
    });
  } catch (error) {
    logger.error("[uploadVideo]", error);

    if (error instanceof multer.MulterError) {
      return res
        .status(500)
        .json({ message: "Multer error occurred during upload!" });
    }

    if (error.message === "THUMBNAIL_GENERATION_FAILED") {
      return res.status(500).json({
        message: "Video uploaded but failed to generate thumbnail!",
      });
    }

    return res.status(500).json({ message: "Something went wrong!" });
  }
};

export const getAllVideos = async (req, res) => {
  try {
    const videos = await getVideos();

    const videosWithImages = await Promise.all(
      videos.map(async (video) => {
        const imageData = await readImageFile(video.imageUrl);

        return {
          id: video._id,
          title: video.title,
          imageUrl: imageData,
          createdAt: video.createdAt,
          updatedAt: video.updatedAt,
        };
      })
    );

    return res.status(200).json(videosWithImages);
  } catch (error) {
    logger.error("[getAllVideos]", error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};
export const getVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const range = req.headers.range;

    if (!id) return res.status(400).json({ message: "Please provide an id!" });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid video ID format!" });
    }

    const video = await getVideoById(id);

    if (!video)
      return res.status(404).json({ message: "Video does not exist!" });

    const videoPath = video.path;
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;

    if (!range) {
      return res.status(416).json({ message: "Requires Range header" });
    }

    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : Math.min(start + 0.5 * 1024 * 1024 - 1, fileSize - 1);

    const chunkSize = end - start + 1;

    const headers = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize.toString(),
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
  } catch (error) {
    logger.error("[getVideo]", error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};
