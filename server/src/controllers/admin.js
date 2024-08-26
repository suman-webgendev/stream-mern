import { getVideos } from "../actions/videos.js";

export const adminExample = async (req, res) => {
  const videos = await getVideos();
  res.render("index", { title: "Home Page", videos });
};
