import { getAllUsers } from "../controllers/users.js";
import { isAuthenticated } from "../middlewares/index.js";

export default (router) => {
  router.get("/users", isAuthenticated, getAllUsers);
};
