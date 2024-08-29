import {
  authCheck,
  login,
  logout,
  register,
} from "../controllers/authentication.js";
import { isAuthenticated } from "../middlewares/index.js";

export default (router) => {
  router.post("/api/auth/register", register);
  router.post("/api/auth/login", login);
  router.post("/api/auth/logout", isAuthenticated, logout);
  router.get("/api/auth/check", authCheck);
};
