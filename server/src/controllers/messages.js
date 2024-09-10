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

//! Fetch all the message for a particular chat without pagination
// export const allMessages = async (req, res) => {
//   try {
//     const messages = await db.Message.find({ chat: req.params.chatId })
//       .populate("sender", "name email")
//       .populate("chat")
//       .sort({ createdAt: 1 });

//     const totalMessages = await db.Message.countDocuments({
//       chat: req.params.chatId,
//     });

//     return res.json({
//       messages,
//     });
//   } catch (error) {
//     logger.error("[FETCHING_MESSAGE_FOR_A_USER]", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

//! Fetch all the message for a particular chat with pagination
export const allMessages = async (req, res) => {
  try {
    const page = Number.isNaN(parseInt(req.query.page))
      ? 1
      : parseInt(req.query.page);
    const limit = 20;
    const totalMessages = await db.Message.countDocuments({
      chat: req.params.chatId,
    });

    const totalPages = Math.ceil(totalMessages / limit);

    if (page < 1 || (page > totalPages && totalMessages > 0)) {
      return res.status(400).json({
        message: `Invalid page number. Valid range: 1 to ${totalPages}`,
      });
    }

    const skip = (totalPages - page) * limit;

    const messages = await db.Message.find({ chat: req.params.chatId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      messages,
      pagination: {
        totalMessages,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage: page < totalPages,
      },
    });
  } catch (error) {
    logger.error("[FETCHING_MESSAGE_FOR_A_USER]", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
