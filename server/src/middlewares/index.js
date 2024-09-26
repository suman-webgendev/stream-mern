"use strict";

import express from "express";
import pkg from "lodash";
import { getUserBySessionToken } from "../actions/users.js";
import { logger } from "../utils/index.js";
const { merge } = pkg;

/**
 * This middleware takes `req`, `res` and `next` as input. It uses the cookie to check if user is authenticated or not.
 * If user is authenticated the it returns the user object and calls the next function. If user is not authenticated, it returns a 401 error and calls the next function.
 *
 * @param {express.Request} req - The incoming request object.
 * @param {express.Response} res - The outgoing response object.
 * @param {express.NextFunction} next - The next function to call in the middleware chain.
 * @returns {express.NextFunction} - The next function to call in the middleware chain.
 */
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
