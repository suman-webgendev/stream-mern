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

export const handleUploadVideo = (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ error: "No files were uploaded." });
  }

  const videoFile = req.files.videoFile;
  const videoTitle = req.body.videoTitle;

  if (!videoTitle) {
    return res.status(400).json({ error: "Video title is required." });
  }

  console.log("Video Title:", videoTitle);
  console.log("File name:", videoFile.name);
  console.log("File size:", videoFile.size);

  res.json({
    message: "File uploaded successfully",
    title: videoTitle,
    fileName: videoFile.name,
  });
};

export const users = async (req, res) => {
  const users = await getUsers();
  return res.render("users", {
    users,
    currentPage: "users",
  });
};
