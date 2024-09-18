import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  authentication: {
    password: { type: String, required: true, select: false },
    salt: { type: String, select: false },
    sessionToken: { type: String, select: false },
  },
  stripeCustomerId: { type: String },
  subscriptionPlan: {
    type: String,
    enum: ["free", "basic", "standard", "premium"],
    default: "free",
  },
  subscriptionStatus: {
    type: String,
    enum: ["active", "canceled", "past_due", "none"],
    default: "none",
  },
  subscriptionId: { type: String },
  subscriptionEndDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.methods.updateSubscription = function (
  plan,
  status,
  subscriptionId,
  endDate
) {
  this.subscriptionPlan = plan;
  this.subscriptionStatus = status;
  this.subscriptionId = subscriptionId;
  this.subscriptionEndDate = endDate;
  this.updatedAt = new Date();
  return this.save();
};

export const User = mongoose.model("User", userSchema);
