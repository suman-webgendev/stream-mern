"use strict";

import { Router } from "express";
import {
  authCheck,
  login,
  logout,
  register,
} from "../controllers/authentication.js";
import { isAuthenticated } from "../middlewares/index.js";
import { rateLimiter } from "../utils/index.js";

/**
 * @param {Router} router
 */
export default (router) => {
  //? Handles register action
  router.post("/api/auth/register", rateLimiter(), register);

  //? Handles login action
  router.post("/api/auth/login", rateLimiter(), login);

  //? Handles logout action
  router.post("/api/auth/logout", isAuthenticated, logout);

  //? Checks if a user logged in or not, using cookie
  router.get("/api/auth/check", authCheck);
};
