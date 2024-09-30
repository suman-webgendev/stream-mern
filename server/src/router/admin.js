"use strict";

import { Router } from "express";

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
import { rateLimiter } from "../utils/index.js";

/**
 * @param {Router} router
 */
export default (router) => {
  //? Renders login page for admin page
  router.get("/", renderLoginPage);

  //? Handles login action within admin page
  router.post("/", rateLimiter(), handleLogin);

  //? Renders dashboard page
  router.get(
    "/dashboard",
    isAuthenticatedAdmin,
    rateLimiter(10, 100),
    dashboard
  );

  //? Renders users page, shows user table
  router.get("/users", isAuthenticatedAdmin, rateLimiter(10, 100), users);

  //? Renders videos page, shows videos table
  router.get("/videos", isAuthenticatedAdmin, rateLimiter(10, 100), videos);

  //? Renders video upload page
  router.get(
    "/video/upload",
    isAuthenticatedAdmin,
    rateLimiter(10, 100),
    displayUploadVideo
  );

  //? Renders create user page
  router.get(
    "/user/create",
    isAuthenticatedAdmin,
    rateLimiter(10, 100),
    displayAddUser
  );

  //?  Handles logout action for admin page
  router.post("/logout", isAuthenticatedAdmin, adminLogout);
};
