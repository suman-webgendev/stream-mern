import {
  authCheck,
  login,
  logout,
  register,
} from "../controllers/authentication.js";
import { isAuthenticated } from "../middlewares/index.js";

export default (router) => {
  router.post("/auth/register", register);
  router.post("/auth/login", login);
  router.post("/auth/logout", isAuthenticated, logout);
  router.get("/auth/check", authCheck);
};
