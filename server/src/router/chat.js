"use strict";

import { Router } from "express";
import {
  accessChats,
  addToGroup,
  createGroupChat,
  getAllChats,
  removeFromGroup,
  renameGroup,
  searchUser,
} from "../controllers/chat.js";
import { isAuthenticated } from "../middlewares/index.js";
import { rateLimiter } from "../utils/index.js";

/**
 * @param {Router} router
 */
export default (router) => {
  //? Find user route
  router.get(
    "/api/chat/find-user",
    isAuthenticated,
    rateLimiter(10, 2000),
    searchUser
  );

  //? Get or Access chat between two users
  router.post("/api/chat", isAuthenticated, rateLimiter(10, 2000), accessChats);

  //? Get all the chats for a user
  router.get("/api/chat", isAuthenticated, rateLimiter(10, 2000), getAllChats);

  //? Create group chat
  router.post(
    "/api/chat/group/create",
    isAuthenticated,
    rateLimiter(10, 2000),
    createGroupChat
  );

  //? Rename a group
  router.put(
    "/api/chat/group/rename",
    isAuthenticated,
    rateLimiter(10, 2000),
    renameGroup
  );

  //? Leave or remove a member from the group
  router.put(
    "/api/chat/group/remove",
    isAuthenticated,
    rateLimiter(10, 2000),
    removeFromGroup
  );

  //? Add a new member to the group
  router.put(
    "/api/chat/group/add",
    isAuthenticated,
    rateLimiter(10, 2000),
    addToGroup
  );
};
