import { rateLimit } from "express-rate-limit";
import { getAllVideos, getVideo, uploadVideo } from "../controllers/videos.js";
import { isAuthenticated } from "../middlewares/index.js";

const videosRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 2000,
  legacyHeaders: false,
  standardHeaders: "draft-7",
  message: {
    message: "Too many attempts, please try again later.",
    retryAfter: 10,
  },
  statusCode: 429,
});

export default (router) => {
  //? Returns all video list
  router.get("/api/video", isAuthenticated, videosRateLimiter, getAllVideos);

  //? Returns a particular video stream using video id
  router.get("/api/video/:id", isAuthenticated, videosRateLimiter, getVideo);

  //? Handles video upload action
  router.post(
    "/api/videos/upload",
    isAuthenticated,
    videosRateLimiter,
    uploadVideo
  );
};
