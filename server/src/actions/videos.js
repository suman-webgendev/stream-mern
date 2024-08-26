import { VideoModel } from "../db/videos.js";

export const getVideos = () => VideoModel.find().sort([["createdAt", -1]]);

export const getVideoById = (id) => VideoModel.findById(id);

export const createVideo = (values) =>
  new VideoModel(values).save().then((video) => video.toObject());

export const deleteVideoById = (id) => VideoModel.findOneAndDelete({ _id: id });

export const updateVideoById = (id, values) =>
  VideoModel.findByIdAndUpdate(id, values);
