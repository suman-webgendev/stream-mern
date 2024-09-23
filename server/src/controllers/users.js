"use strict";

import { getUsers } from "../actions/users.js";
import { logger } from "../utils/index.js";

/**
 * This function returns a list of the users.
 *
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The outgoing response object.
 * @returns {Promise<Response>} - A Promise that resolves to the response object.
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
