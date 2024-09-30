"use strict";

import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";

import {
  getAdminByEmail,
  getAdminBySessionToken,
  getAdmins,
} from "../actions/admin.js";
import { getUsers } from "../actions/users.js";
import { getVideos } from "../actions/videos.js";
import { authentication, logger, readImageFile } from "../utils/index.js";

dotenv.config();

/**
 * Renders login page for admin.
 * @param {express.Request} req - The incoming request object.
 * @param {express.Response} res - The outgoing response object.
 * @returns {Promise<express.Response>} - A Promise that resolves to the response object.
 */
export const renderLoginPage = async (req, res) => {
  try {
    const token = req.cookies["stream_auth"];
    if (!token) return res.render("login", { title: "Login", error: null });

    jwt.verify(token, process.env.AUTH_SECRET);

    const existingAdmin = await getAdminBySessionToken(token);

    if (!existingAdmin)
      return res.render("login", { title: "Login", error: null });

    return res.redirect("/dashboard");
  } catch (error) {
    logger.error("[ADMIN_RENDER_LOGIN_PAGE]", error);
    return res.render("login", { title: "Login", error: null });
  }
};

/**
 * This function handles login action for admin.
 * @param {express.Request} req - The incoming request object.
 * @param {express.Response} res - The outgoing response object.
 * @returns {Promise<express.Response>} - A Promise that resolves to the response object.
 */
export const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Please fill all the required fields!" });

    const admin = await getAdminByEmail(email).select(
      "+authentication.salt +authentication.password"
    );

    if (!admin)
      return res.render("login", {
        title: "Login",
        error: "Invalid credentials!",
      });

    const expectedHash = authentication(admin.authentication.salt, password);

    if (admin.authentication.password !== expectedHash)
      return res.render("login", {
        title: "Login",
        error: "Password mismatch!",
      });

    const token = jwt.sign(
      { userId: admin._id, username: admin.name },
      process.env.AUTH_SECRET,
      {
        expiresIn: "24h",
      }
    );

    admin.authentication.sessionToken = token;
    await admin.save();

    res.cookie("stream_auth", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
    });

    return res.redirect("/dashboard");
  } catch (error) {
    logger.error("[ADMIN_LOGIN]", error);
    let errorMessage = "An error occurred. Please try again.";
    if (error.response) {
      errorMessage = error.response.data.message || errorMessage;
    }
    return res.render("login", {
      title: "Login",
      error: errorMessage,
    });
  }
};

/**
 * Renders dashboard page for admin.
 * @param {express.Request} req - The incoming request object.
 * @param {express.Response} res - The outgoing response object.
 * @returns {Promise<express.Response>} - A Promise that resolves to the response object.
 */
export const dashboard = async (req, res) => {
  try {
    const videos = await getVideos();
    const user = await getUsers();
    const admins = await getAdmins();
    const users = [...user, ...admins];

    return res.render("dashboard", {
      videos: videos.length,
      users: users.length,
      currentPage: "dashboard",
    });
  } catch (error) {
    logger.error("[ADMIN_DASHBOARD]", error);
    return res.render("dashboard", {
      videos: 0,
      users: 0,
      currentPage: "dashboard",
    });
  }
};

/**
 * Returns video list as data-table for admin.
 * @param {express.Request} req - The incoming request object.
 * @param {express.Response} res - The outgoing response object.
 * @returns {Promise<express.Response>} - A Promise that resolves to the response object.
 */
export const videos = async (req, res) => {
  try {
    const videos = await getVideos();
    const videosWithImages = await Promise.all(
      videos.map(async (video) => {
        const imageData = await readImageFile(video.imageUrl);

        return {
          id: video._id,
          title: video.title,
          imageUrl: imageData,
          createdAt: video.createdAt,
          updatedAt: video.updatedAt,
        };
      })
    );

    return res.render("videos", {
      videos: videosWithImages,
      currentPage: "videos",
    });
  } catch (error) {
    logger.error("[ADMIN_VIDEOS]", error);
    return res.render("videos", {
      videos: [],
      currentPage: "videos",
    });
  }
};

/**
 * Renders video upload page for admin.
 * @param {express.Request} req - The incoming request object.
 * @param {express.Response} res - The outgoing response object.
 * @returns {Promise<express.Response>} - A Promise that resolves to the response object.
 */
export const displayUploadVideo = async (req, res) => {
  return res.render("upload", { currentPage: "videos" });
};

/**
 * Renders add user page for admin.
 * @param {express.Request} req - The incoming request object.
 * @param {express.Response} res - The outgoing response object.
 * @returns {Promise<express.Response>} - A Promise that resolves to the response object.
 */
export const displayAddUser = async (req, res) => {
  return res.render("adduser", { currentPage: "users" });
};

/**
 * Renders user list as data-table for admin.
 * @param {express.Request} req - The incoming request object.
 * @param {express.Response} res - The outgoing response object.
 * @returns {Promise<express.Response>} - A Promise that resolves to the response object.
 */
export const users = async (req, res) => {
  try {
    const users = await getUsers();
    return res.render("users", {
      users,
      currentPage: "users",
    });
  } catch (error) {
    logger.error("[ADMIN_USER_LIST]", error);
    return res.render("users", {
      users: [],
      currentPage: "users",
    });
  }
};

/**
 * Handles logout action for the admin.
 * @param {express.Request} req - The incoming request object.
 * @param {express.Response} res - The outgoing response object.
 * @returns {Promise<express.Response>} - A Promise that resolves to the response object.
 */
export const adminLogout = async (req, res) => {
  try {
    const token = req.cookies["stream_auth"];
    if (!token) return res.redirect("/");

    const admin = await getAdminBySessionToken(token);

    if (admin) {
      admin.authentication.sessionToken = null;
      await admin.save();
    }
    res.clearCookie("stream_auth", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production",
    });
    return res.redirect("/");
  } catch (error) {
    logger.error("[ADMIN_LOGOUT]", error);
  }
};
