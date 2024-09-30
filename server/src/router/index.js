"use strict";

import express from "express";
import admin from "./admin";
import authentication from "./authentication";
import chat from "./chat.js";
import messages from "./messages";
import payment from "./payment";
import users from "./users";
import videos from "./videos";

const router = express.Router();

export default () => {
  authentication(router);
  users(router);
  videos(router);
  admin(router);
  chat(router);
  messages(router);
  payment(router);
  return router;
};
