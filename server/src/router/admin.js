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

import { rateLimit } from "express-rate-limit";

const adminRateLimiter = rateLimit({
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
  //? Renders login page for admin page
  router.get("/", renderLoginPage);

  //? Handles login action within admin page
  router.post("/", adminRateLimiter, handleLogin);

  //? Renders dashboard page
  router.get("/dashboard", isAuthenticatedAdmin, adminRateLimiter, dashboard);

  //? Renders users page, shows user table
  router.get("/users", isAuthenticatedAdmin, adminRateLimiter, users);

  //? Renders videos page, shows videos table
  router.get("/videos", isAuthenticatedAdmin, adminRateLimiter, videos);

  //? Renders video upload page
  router.get(
    "/video/upload",
    isAuthenticatedAdmin,
    adminRateLimiter,
    displayUploadVideo
  );

  //? Renders create user page
  router.get(
    "/user/create",
    isAuthenticatedAdmin,
    adminRateLimiter,
    displayAddUser
  );

  //?  Handles logout action for admin page
  router.post("/logout", isAuthenticatedAdmin, adminLogout);
};
