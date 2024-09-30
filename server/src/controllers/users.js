"use strict";

import express from "express";

import { getUsers } from "../actions/users.js";
import { logger } from "../utils/index.js";

/**
 * This function returns a list of all users in the database.
 * It extracts the logged-in user's ID from the request identity, checks if the user exists, and if the user is not the group admin. If all conditions are met, it returns a list of all users in the database.
 *
 * @param {express.Request} req - The incoming request object.
 * @param {express.Response} res - The outgoing response object.
 * @returns {Promise<express.Response>} - A Promise that resolves to the response object.
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await getUsers();
    return res.status(200).json(users);
  } catch (error) {
    logger.error("[getAllUser]", error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};
