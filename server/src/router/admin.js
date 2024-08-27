import {
  dashboard,
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
};
