import { Router } from "express";

import { getAllUsers } from "@/controllers/users";
import { isAuthenticated } from "@/middlewares";
import { rateLimiter } from "@/utils";

/**
 * @param {Router} router
 */
export default (router) => {
  //? Returns all user list
  router.get("/api/users", isAuthenticated, rateLimiter(10, 100), getAllUsers);
};
