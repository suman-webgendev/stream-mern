import { getUsers } from "../actions/users.js";
import { logger } from "../utils/index.js";

//! Get all user list
export const getAllUsers = async (req, res) => {
  try {
    const users = await getUsers();
    return res.status(200).json(users);
  } catch (error) {
    logger.error("[getAllUser]", error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};
