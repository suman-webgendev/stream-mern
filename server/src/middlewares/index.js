import pkg from "lodash";
import { getUserBySessionToken } from "../actions/users.js";
import { logger } from "../utils/index.js";
const { merge } = pkg;

export const isAuthenticated = async (req, res, next) => {
  try {
    const sessionToken = req.cookies["stream_auth"];

    if (!sessionToken)
      return res
        .status(401)
        .json({ message: "Please login before performing the action!" });

    const existingUser = await getUserBySessionToken(sessionToken);

    if (!existingUser)
      return res.status(404).json({ message: "User not found!" });

    merge(req, { identity: existingUser });

    return next();
  } catch (error) {
    logger.error("isAuthenticated middleware: ", error.stack);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};
