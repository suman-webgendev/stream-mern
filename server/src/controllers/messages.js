"use strict";

import express from "express";

import { db } from "../db/index.js";
import { logger } from "../utils/index.js";

/**
 * This function takes `req` and `res` as input. It extracts `currentUserId` from `req.identity` and also extracts `messageContent`, `chatId` and `chatType` from `req` body.
 * It sends the message to the particular chat and updates the database.
 *
 * @param {express.Request} req - The incoming request object.
 * @param {express.Response} res - The outgoing response object.
 * @returns {Promise<express.Response>} - A Promise that resolves to the response object.
 */
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

/**
 * This function takes `req` and `res` as input. It extracts the `page` and `chatId` from the `req` body.
 * It fetches all the messages and returns chats with `20` messages per page.
 *
 * @param {express.Request} req - The incoming request object.
 * @param {express.Response} res - The outgoing response object.
 * @returns {Promise<express.Response>} - A Promise that resolves to the response object.
 */
export const allMessages = async (req, res) => {
  try {
    const page = Number.isNaN(parseInt(req.query.page))
      ? 1
      : parseInt(req.query.page);

    const chatId = req.params.chatId;
    const limit = 20;
    const totalMessages = await db.Message.countDocuments({
      chat: chatId,
    });

    const totalPages = Math.ceil(totalMessages / limit);

    if (page < 1 || (page > totalPages && totalMessages > 0)) {
      return res.status(400).json({
        message: `Invalid page number. Valid range: 1 to ${totalPages}`,
      });
    }

    const skip = (totalPages - page) * limit;

    const messages = await db.Message.find({ chat: chatId })
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
