"use strict";

import express from "express";
import pkg from "lodash";
import { getAdminBySessionToken } from "../actions/admin.js";
import { logger } from "../utils/index.js";
const { merge } = pkg;

/**
 * This middleware takes `req`, `res` and `next` as input. It uses the cookie to check if admin is authenticated or not.
 * If admin is authenticated the it returns the admin object and calls the next function. If the user is not authenticated, it returns a 401 error and calls the next function.
 *
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The outgoing response object.
 * @param {express.NextFunction} next - The next function to call in the middleware chain.
 * @returns {express.NextFunction} - The next function to call in the middleware chain.
 */
export const isAuthenticatedAdmin = async (req, res, next) => {
  try {
    const sessionToken = req.cookies["stream_auth"];

    if (!sessionToken) return res.status(401).redirect("/");

    const existingAdmin = await getAdminBySessionToken(sessionToken);

    if (!existingAdmin) return res.status(404).redirect("/");

    merge(req, { identity: existingAdmin });

    return next();
  } catch (error) {
    logger.error("isAuthenticated middleware: ", error.cause);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};
