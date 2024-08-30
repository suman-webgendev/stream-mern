import express from "express";
import admin from "./admin.js";
import authentication from "./authentication.js";
import chat from "./chat.js";
import users from "./users.js";
import videos from "./videos.js";

const router = express.Router();

export default () => {
  authentication(router);
  users(router);
  videos(router);
  admin(router);
  chat(router);
  return router;
};
