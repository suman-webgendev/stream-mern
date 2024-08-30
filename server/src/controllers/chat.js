import { db } from "../db/index.js";
import { logger } from "../utils/index.js";

//! Get the chat between two user if doesn't exist create one
export const accessChats = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUser = req.identity._id;

    if (!userId) {
      return res.status(400).json({ message: "No userId was provided!" });
    }

    let chat = await db.Chat.findOne({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: currentUser } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate({
        path: "users",
        select:
          "-authentication.password -authentication.salt -authentication.sessionToken",
      })
      .populate("lastMessage");

    chat = await db.User.populate(chat, {
      path: "lastMessage.sender",
      select: "name email",
    });

    if (chat) {
      return res.status(200).json(chat);
    } else {
      const chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [currentUser, userId],
      };

      const createdChat = await db.Chat.create(chatData);

      const fullChat = await db.Chat.findOne({ _id: createdChat._id }).populate(
        {
          path: "users",
          select:
            "-authentication.password -authentication.salt -authentication.sessionToken",
        }
      );

      return res.status(200).json(fullChat);
    }
  } catch (error) {
    logger.error("[ACCESS_CHATS]", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//! Get all the chats for a user
export const getAllChats = async (req, res) => {
  const currentUser = req.identity._id;

  try {
    let chats = await db.Chat.find({
      users: {
        $elemMatch: {
          $eq: currentUser,
        },
      },
    })
      .populate({
        path: "users",
        select:
          "-authentication.password -authentication.salt -authentication.sessionToken",
      })
      .populate({
        path: "groupAdmin",
        select:
          "-authentication.password -authentication.salt -authentication.sessionToken",
      })
      .populate("lastMessage")
      .sort([["updatedAt", -1]]);

    chats = await db.User.populate(chats, {
      path: "lastMessage.sender",
      select: "name email",
    });

    return res.status(200).send(chats);
  } catch (error) {
    logger.error("[GET_ALL_CHATS]", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//! Search users
export const searchUser = async (req, res) => {
  try {
    const searchTerm = req.query.search;
    const currentUser = req.identity._id;

    let searchCriteria = {};

    //* If there's a search term, build the search criteria
    if (searchTerm) {
      searchCriteria = {
        $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { email: { $regex: searchTerm, $options: "i" } },
        ],
        //* Exclude the current user from the results
        _id: { $ne: currentUser },
      };
    }

    const users = await db.User.find(searchCriteria);
    return res.status(200).json(users);
  } catch (error) {
    logger.error("[SEARCH_USER]", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//! Create group chat
export const createGroupChat = async (req, res) => {
  try {
    const currentUser = req.identity._id;
    const groupName = req.body.name;

    if (!groupName || !req.body.users)
      return res
        .status(400)
        .json({ message: "Please fill all the required fields!" });

    let members = JSON.parse(req.body.users);

    if (members.length < 2)
      return res
        .status(400)
        .json({ message: "At least 2 are users required to create a group!" });

    members.push(currentUser);

    const groupChat = await db.Chat.create({
      chatName: groupName,
      users: members,
      isGroupChat: true,
      groupAdmin: currentUser,
    });

    const fullGroupChat = await db.Chat.findOne({
      _id: groupChat._id,
    })
      .populate({
        path: "users",
        select:
          "-authentication.password -authentication.salt -authentication.sessionToken",
      })
      .populate({
        path: "groupAdmin",
        select:
          "-authentication.password -authentication.salt -authentication.sessionToken",
      });

    return res.status(201).json(fullGroupChat);
  } catch (error) {
    logger.error("[CREATE_GROUP_CHAT]", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//! Rename group
export const renameGroup = async (req, res) => {
  try {
    const { groupId, groupName } = req.body;

    const updatedChat = await db.Chat.findByIdAndUpdate(
      groupId,
      {
        chatName: groupName,
      },
      {
        new: true,
      }
    )
      .populate({
        path: "users",
        select:
          "-authentication.password -authentication.salt -authentication.sessionToken",
      })
      .populate({
        path: "groupAdmin",
        select:
          "-authentication.password -authentication.salt -authentication.sessionToken",
      });

    if (!updatedChat)
      return res.status(404).json({ message: "Group not found!" });

    return res.status(200).json(updatedChat);
  } catch (error) {
    logger.error("[RENAME_GROUP]", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//! Remove a member from the group
export const removeFromGroup = async (req, res) => {
  try {
    const { groupId, userId } = req.body;

    if (!groupId || !userId) {
      return res
        .status(400)
        .json({ message: "Please fill all the required fields" });
    }

    const removedUser = await db.Chat.findByIdAndUpdate(
      groupId,
      {
        $pull: {
          users: userId,
        },
      },
      { new: true }
    )
      .populate({
        path: "users",
        select:
          "-authentication.password -authentication.salt -authentication.sessionToken",
      })
      .populate({
        path: "groupAdmin",
        select:
          "-authentication.password -authentication.salt -authentication.sessionToken",
      });

    if (!removedUser) {
      return res.status(404).json({ message: "Group not found!" });
    }

    return res.status(200).json(removedUser);
  } catch (error) {
    logger.error("[REMOVE_FROM_GROUP]", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//! Add a member to the group
export const addToGroup = async (req, res) => {
  try {
    const { groupId, userId } = req.body;

    if (!groupId || !userId) {
      return res
        .status(400)
        .json({ message: "Please fill all the required fields" });
    }

    const addedUser = await db.Chat.findByIdAndUpdate(
      groupId,
      {
        $push: {
          users: userId,
        },
      },
      { new: true }
    )
      .populate({
        path: "users",
        select:
          "-authentication.password -authentication.salt -authentication.sessionToken",
      })
      .populate({
        path: "groupAdmin",
        select:
          "-authentication.password -authentication.salt -authentication.sessionToken",
      });

    if (!addedUser) {
      return res.status(404).json({ message: "Group not found!" });
    }

    return res.status(200).json(addedUser);
  } catch (error) {
    logger.error("[ADD_TO_GROUP]", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
