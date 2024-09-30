import { Router } from "express";

import { getAllVideos, getVideo, uploadVideo } from "@/controllers/videos";
import { isAuthenticated } from "@/middlewares";
import { rateLimiter } from "@/utils";

/**
 * @param {Router} router
 */
export default (router) => {
  //? Returns all video list
  router.get(
    "/api/video",
    isAuthenticated,
    rateLimiter(10, 2000),
    getAllVideos
  );

  //? Returns a particular video stream using video id
  router.get("/api/video/:id", isAuthenticated, getVideo);

  //? Handles video upload action
  router.post(
    "/api/videos/upload",
    isAuthenticated,
    rateLimiter(),
    uploadVideo
  );
};
