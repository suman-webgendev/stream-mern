import express from "express";
import authentication from "./authentication.js";
import users from "./users.js";
import videos from "./videos.js";

const router = express.Router();

export default () => {
  authentication(router);
  users(router);
  videos(router);
  return router;
};
