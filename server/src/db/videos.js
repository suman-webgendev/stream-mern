import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  title: { type: String, required: true },
  path: { type: String, required: true },
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Video = mongoose.model("Video", videoSchema);
