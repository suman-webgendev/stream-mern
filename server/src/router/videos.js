import { getAllVideos, getVideo, uploadVideo } from "../controllers/videos.js";
import { isAuthenticated } from "../middlewares/index.js";

export default (router) => {
  router.get("/api/video", isAuthenticated, getAllVideos);
  router.get("/api/video/:id", isAuthenticated, getVideo);
  router.post("/api/videos/upload", isAuthenticated, uploadVideo);
};
