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

export default (router) => {
  //? Find user route
  router.get("/api/chat/find-user", isAuthenticated, searchUser);

  //? Get or Access chat between two users
  router.post("/api/chat", isAuthenticated, accessChats);

  //? Get all the chats for a user
  router.get("/api/chat", isAuthenticated, getAllChats);

  //? Create group chat
  router.post("/api/chat/group/create", isAuthenticated, createGroupChat);

  //? Rename a group
  router.put("/api/chat/group/rename", isAuthenticated, renameGroup);

  //? Leave or remove a member from the group
  router.put("/api/chat/group/remove", isAuthenticated, removeFromGroup);

  //? Add a new member to the group
  router.put("/api/chat/group/add", isAuthenticated, addToGroup);
};
