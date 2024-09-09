import { db } from "../db/index.js";
import { logger } from "../utils/index.js";

//! Sending message to a user or group
export const sendMessage = async (req, res) => {
  try {
    const currentUser = req.identity._id;
    const { content, chatId, type } = req.body;

    if (!content || !chatId) {
      return res.status(400).json({ message: "Invalid data" });
    }

    let newMessage = {
      sender: currentUser,
      content,
      chat: chatId,
      type: type || "text",
    };

    let message = await db.Message.create(newMessage);
    message = await message.populate("sender", "name");
    message = await message.populate("chat");
    message = await db.User.populate(message, {
      path: "chat.users",
      select: "name email",
    });

    await db.Chat.findByIdAndUpdate(req.body.chatId, {
      lastMessage: message,
    });

    return res.status(201).json(message);
  } catch (error) {
    console.error("[SEND_MESSAGE]", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//! Fetch all the message for a particular chat
export const allMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;

    const skip = (page - 1) * limit;

    const messages = await db.Message.find({ chat: req.params.chatId })
      .populate("sender", "name email")
      .populate("chat")
      .skip(skip)
      .limit(limit);

    const totalMessages = await db.Message.countDocuments({
      chat: req.params.chatId,
    });

    return res.json({
      messages,
      pagination: {
        totalMessages,
        totalPages: Math.ceil(totalMessages / limit),
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    logger.error("[FETCHING_MESSAGE_FOR_A_USER]", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
