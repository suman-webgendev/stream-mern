"use strict";

import { Router } from "express";

import { allMessages, sendMessage } from "../controllers/messages.js";
import { isAuthenticated } from "../middlewares/index.js";

/**
 * @param {Router} router
 */
export default (router) => {
  //? Send a message to a particular user or group
  router.post("/api/chat/message", isAuthenticated, sendMessage);

  //? Fetch all the chats for a particular chatId
  router.get("/api/chat/message/:chatId", isAuthenticated, allMessages);
};
