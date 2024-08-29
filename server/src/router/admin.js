import {
  dashboard,
  displayAddUser,
  displayUploadVideo,
  handleLogin,
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
  router.get("/admin/user/create", displayAddUser);
};
