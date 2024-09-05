import { rateLimit } from "express-rate-limit";
import {
  authCheck,
  login,
  logout,
  register,
} from "../controllers/authentication.js";
import { isAuthenticated } from "../middlewares/index.js";

const authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  legacyHeaders: false,
  standardHeaders: "draft-7",
  message: {
    message: "Too many login/register attempts, please try again later.",
    retryAfter: 10,
  },
  statusCode: 429,
});

export default (router) => {
  //? Handles register action
  router.post("/api/auth/register", authRateLimiter, register);

  //? Handles login action
  router.post("/api/auth/login", authRateLimiter, login);

  //? Handles logout action
  router.post("/api/auth/logout", isAuthenticated, logout);

  //? Checks if a user logged in or not, using cookie
  router.get("/api/auth/check", authCheck);
};
