"use strict";

import {
  authCheck,
  login,
  logout,
  register,
} from "@/controllers/authentication";
import { isAuthenticated } from "@/middlewares";
import { rateLimiter } from "@/utils";
import { Router } from "express";

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
