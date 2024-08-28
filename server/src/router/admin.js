import {
  dashboard,
  displayUploadVideo,
  handleLogin,
  handleUploadVideo,
  renderLoginPage,
  users,
  videos,
} from "../controllers/admin.js";

export default (router) => {
  router.get("/admin/login", renderLoginPage);
  router.post("/admin/login", handleLogin);
  router.get("/admin/dashboard", dashboard);
  router.get("/admin/users", users);
  router.get("/admin/videos", videos);
  router.get("/admin/video/upload", displayUploadVideo);
  router.post("/admin/video/upload", handleUploadVideo);
};
