import axios from "axios";
import { getUsers } from "../actions/users.js";
import { getVideos } from "../actions/videos.js";
import { readImageFile } from "../utils/index.js";

export const renderLoginPage = (req, res) => {
  return res.render("login", { title: "Login", error: null });
};

export const handleLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await axios.post("http://localhost:8080/auth/login", {
      email,
      password,
    });

    if (response.status === 200) {
      return res.redirect("/admin/dashboard");
    }
  } catch (error) {
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

export const dashboard = async (req, res) => {
  const videos = await getVideos();
  const users = await getUsers();
  return res.render("dashboard", {
    videos: videos.length,
    users: users.length,
    currentPage: "dashboard",
  });
};

export const videos = async (req, res) => {
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
};

export const displayUploadVideo = (req, res) => {
  return res.render("upload", { currentPage: "videos" });
};

export const displayAddUser = (req, res) => {
  return res.render("adduser", { currentPage: "users" });
};

export const users = async (req, res) => {
  const users = await getUsers();
  return res.render("users", {
    users,
    currentPage: "users",
  });
};
