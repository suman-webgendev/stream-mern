"use strict";

import { allMessages, sendMessage } from "@/controllers/messages";
import { isAuthenticated } from "@/middlewares";
import { Router } from "express";

/**
 * @param {Router} router
 */
export default (router) => {
  //? Send a message to a particular user or group
  router.post("/api/chat/message", isAuthenticated, sendMessage);

  //? Fetch all the chats for a particular chatId
  router.get("/api/chat/message/:chatId", isAuthenticated, allMessages);
};
