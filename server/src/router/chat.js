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

import { rateLimit } from "express-rate-limit";

const chatRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 2000,
  legacyHeaders: false,
  standardHeaders: "draft-7",
  message: {
    message: "Too many attempts, please try again later.",
    retryAfter: 10,
  },
  statusCode: 429,
});

export default (router) => {
  //? Find user route
  router.get(
    "/api/chat/find-user",
    isAuthenticated,
    chatRateLimiter,
    searchUser
  );

  //? Get or Access chat between two users
  router.post("/api/chat", isAuthenticated, chatRateLimiter, accessChats);

  //? Get all the chats for a user
  router.get("/api/chat", isAuthenticated, chatRateLimiter, getAllChats);

  //? Create group chat
  router.post(
    "/api/chat/group/create",
    isAuthenticated,
    chatRateLimiter,
    createGroupChat
  );

  //? Rename a group
  router.put(
    "/api/chat/group/rename",
    isAuthenticated,
    chatRateLimiter,
    renameGroup
  );

  //? Leave or remove a member from the group
  router.put(
    "/api/chat/group/remove",
    isAuthenticated,
    chatRateLimiter,
    removeFromGroup
  );

  //? Add a new member to the group
  router.put(
    "/api/chat/group/add",
    isAuthenticated,
    chatRateLimiter,
    addToGroup
  );
};
