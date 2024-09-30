"use strict";

import { Router } from "express";

import { getAllUsers } from "../controllers/users.js";
import { isAuthenticated } from "../middlewares/index.js";
import { rateLimiter } from "../utils/index.js";

/**
 * @param {Router} router
 */
export default (router) => {
  //? Returns all user list
  router.get("/api/users", isAuthenticated, rateLimiter(10, 100), getAllUsers);
};
