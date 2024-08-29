import {
  adminLogout,
  dashboard,
  displayAddUser,
  displayUploadVideo,
  handleLogin,
  renderLoginPage,
  users,
  videos,
} from "../controllers/admin.js";
import { isAuthenticatedAdmin } from "../middlewares/admin.js";

export default (router) => {
  router.get("/", renderLoginPage);
  router.post("/", handleLogin);
  router.get("/dashboard", isAuthenticatedAdmin, dashboard);
  router.get("/users", isAuthenticatedAdmin, users);
  router.get("/videos", isAuthenticatedAdmin, videos);
  router.get("/video/upload", isAuthenticatedAdmin, displayUploadVideo);
  router.get("/user/create", isAuthenticatedAdmin, displayAddUser);
  router.post("/logout", isAuthenticatedAdmin, adminLogout);
};
