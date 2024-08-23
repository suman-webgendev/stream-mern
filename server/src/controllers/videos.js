import fs from "fs";
import mongoose from "mongoose";
import multer from "multer";
import { createVideo, getVideoById, getVideos } from "../actions/videos.js";
import { VideoModel } from "../db/videos.js";
import { generateThumbnail, storage } from "../utils/index.js";

const upload = multer({ storage: storage });

export const getAllVideos = async (req, res) => {
  try {
    const videos = await getVideos();
    return res.status(200).json(videos);
  } catch (error) {
    console.error("[getAllUser]", error);
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

    const videoTitle = video.name;

    const videoPath = video.path;
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;

    if (!range) {
      return res.status(416).json({ message: "Requires Range header" });
    }

    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const chunkSize = 1 * 1024 * 1024;
    const end = Math.min(start + chunkSize - 1, fileSize - 1);

    const headers = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize.toString(),
      "Content-Type": "video/mp4",
    };
    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
    return;
  } catch (error) {
    console.error("[getVideo]", error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};

export const uploadVideo = async (req, res) => {
  try {
    upload.single("video")(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        console.error("[uploadVideo]", err);
        return res
          .status(500)
          .json({ message: "Multer error occurred during upload!" });
      } else if (err) {
        console.error("[uploadVideo]", err);
        return res
          .status(500)
          .json({ message: "Unknown error occurred during upload!" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded!" });
      }

      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ message: "Title is required!" });
      }

      const videoPath = req.file.path;

      const videoData = {
        title,
        path: videoPath,
      };

      const savedVideo = await createVideo(videoData);

      const thumbnailPath = `public/thumbnails/${savedVideo._id}_thumbnail.webp`;

      try {
        await generateThumbnail(videoPath, thumbnailPath);

        const updatedVideo = await VideoModel.findByIdAndUpdate(
          savedVideo._id,
          { imageUrl: thumbnailPath },
          { new: true }
        );

        return res.status(200).json({
          message: "Video uploaded and saved successfully!",
          video: updatedVideo,
        });
      } catch (thumbnailError) {
        console.error("[generateThumbnail]", thumbnailError);
        return res.status(500).json({
          message: "Video uploaded but failed to generate thumbnail!",
        });
      }
    });
  } catch (error) {
    console.error("[uploadVideo]", error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};
