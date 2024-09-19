import express from "express";
import {
  createSubscription,
  getAllStripePlans,
  stripeWebhook,
} from "../controllers/payment.js";
import { isAuthenticated } from "../middlewares/index.js";

export default (router) => {
  //? Create subscription
  router.post("/api/subscriptions", isAuthenticated, createSubscription);

  router.post(
    "/api/subscriptions/webhook",
    express.raw({ type: "application/json" }),
    stripeWebhook
  );

  //? Returns all the plans along with the prices
  router.get("/api/subscription/products", isAuthenticated, getAllStripePlans);
};
