"use strict";

import { db } from "../db/index.js";

export const getVideos = () => db.Video.find().sort([["createdAt", -1]]);

export const getVideoById = (id) => db.Video.findById(id);

export const createVideo = (values) =>
  new db.Video(values).save().then((video) => video.toObject());
