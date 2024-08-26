import { adminExample } from "../controllers/admin.js";

export default (router) => {
  router.get("/admin/example", adminExample);
};
