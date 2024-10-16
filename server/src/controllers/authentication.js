"use strict";

import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";

import {
  createUser,
  getUserByEmail,
  getUserBySessionToken,
} from "../actions/users.js";
import { authentication, logger, random } from "../utils/index.js";

dotenv.config();

/**
 * Handles register action for user. It extracts `email`, `password`, and `name` from the request body, checks if the `email` is already in use, and if the `password` and `name` are valid. If all conditions are met, it creates a new user and returns a success message to the client.
 *
 * @param {express.Request} req - The incoming request object.
 * @param {express.Response} res - The outgoing response object.
 * @returns {Promise<express.Response>} - A Promise that resolves to the response object.
 */
export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name)
      return res
        .status(400)
        .json({ message: "Please fill all the required fields!" });

    const existingUser = await getUserByEmail(email);

    if (existingUser)
      return res.status(409).json({ message: "Email already in use!" });

    const salt = random();
    const user = await createUser({
      email,
      name,
      authentication: {
        salt,
        password: authentication(salt, password),
      },
    });

    return res
      .status(201)
      .json({ message: "User registered successfully!" })
      .end();
  } catch (error) {
    logger.error("[REGISTER_USER]", error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};

/**
 * Handles login action for user. It extracts `email` and `password` from the request body, checks if the user exists, and if the `password` matches the stored hash. If both conditions are met, it generates a session token and returns it to the client.
 *
 * @param {express.Request} req - The incoming request object.
 * @param {express.Response} res - The outgoing response object.
 * @returns {Promise<express.Response>} - A Promise that resolves to the response object.
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Please fill all the required fields!" });

    const user = await getUserByEmail(email).select(
      "+authentication.salt +authentication.password"
    );

    if (!user) return res.status(404).json({ message: "User not found!" });

    const expectedHash = authentication(user.authentication.salt, password);

    if (user.authentication.password !== expectedHash)
      return res.status(403).json({ message: "Password mismatch!" });

    const token = jwt.sign(
      { userId: user._id, username: user.name },
      process.env.AUTH_SECRET,
      {
        expiresIn: "24h",
      }
    );

    user.authentication.sessionToken = token;
    await user.save();

    res.cookie("stream_auth", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      message: "Successfully logged in.",
    });
  } catch (error) {
    logger.error("[LOGIN_USER]", error);
    return res.status(500).json({ message: "Something went wrong!" });
  }
};

/**
 * This function logs out the user by clearing the session token cookie.
 *
 * @param {express.Request} req - The incoming request object.
 * @param {express.Response} res - The outgoing response object.
 * @returns {Promise<express.Response>} - A Promise that resolves to the response object.
 */
export const logout = async (req, res) => {
  try {
    const token = req.cookies.stream_auth;

    if (!token)
      return res.status(401).json({ message: "No active session found." });

    const user = await getUserBySessionToken(token);

    if (user) {
      user.authentication.sessionToken = null;
      await user.save();
    }
    res.clearCookie("stream_auth", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({ message: "Successfully logged out." });
  } catch (error) {
    logger.error("[LOGOUT_USER]", error);
    return res
      .status(500)
      .json({ message: "An error occurred during logout." });
  }
};

/**
 * Checks if a user logged in or not using the session token. If the user is logged in, it returns the user object. If the user is not logged in, it returns null.
 *
 * @param {express.Request} req - The incoming request object.
 * @param {express.Response} res - The outgoing response object.
 * @returns {Promise<express.Response>} - A Promise that resolves to the response object.
 */
export const authCheck = async (req, res) => {
  try {
    const token = req.cookies["stream_auth"];

    if (!token)
      return res.status(200).json({ authenticated: false, user: null });

    jwt.verify(token, process.env.AUTH_SECRET);

    const existingUser = await getUserBySessionToken(token);

    if (!existingUser)
      return res.status(200).json({ authenticated: false, user: null });

    return res.status(200).json({ authenticated: true, user: existingUser });
  } catch (error) {
    logger.error("[USER_AUTH_CHECK]", error);
    return res.status(401).json({ authenticated: false, user: null });
  }
};
