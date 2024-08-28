import { getAllVideos, getVideo, uploadVideo } from "../controllers/videos.js";
import { isAuthenticated } from "../middlewares/index.js";

export default (router) => {
  router.get("/video", isAuthenticated, getAllVideos);
  router.get("/video/:id", isAuthenticated, getVideo);
  // router.post("/videos/upload", isAuthenticated, uploadVideo);
  router.post("/videos/upload", uploadVideo);
};
