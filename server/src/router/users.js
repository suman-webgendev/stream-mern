import { getAllUsers } from "../controllers/users.js";
import { isAuthenticated } from "../middlewares/index.js";

import { rateLimit } from "express-rate-limit";

const usersRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  legacyHeaders: false,
  standardHeaders: "draft-7",
  message: {
    message: "Too many attempts, please try again later.",
    retryAfter: 10,
  },
  statusCode: 429,
});

export default (router) => {
  //? Returns all user list
  router.get("/api/users", isAuthenticated, usersRateLimiter, getAllUsers);
};
