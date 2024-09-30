"use strict";

import { db } from "@/db";

export const getVideos = () =>
  db.Video.find()
    .sort([["createdAt", -1]])
    .populate("owner", "name email");

export const getVideoById = (id) =>
  db.Video.findById(id).populate("owner", "name email");

export const createVideo = (values) =>
  new db.Video(values).save().then((video) => video.toObject());
