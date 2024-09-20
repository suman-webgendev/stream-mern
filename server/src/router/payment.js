import express, { Router } from "express";
import {
  createSubscription,
  getAllStripePlans,
  stripeWebhook,
  verifySession,
} from "../controllers/payment.js";
import { isAuthenticated } from "../middlewares/index.js";

/**
 * @param {Router} router
 */

export default (router) => {
  //? Create subscription
  router.post("/api/subscriptions", isAuthenticated, createSubscription);

  router.post(
    "/api/subscriptions/webhook",
    express.raw({ type: "application/json" }),
    stripeWebhook
  );

  //? Returns all the plans along with the prices
  router.get("/api/subscription/plans", isAuthenticated, getAllStripePlans);

  //? Verify after completing a payment
  router.post(
    "/api/subscription/verify-session",
    isAuthenticated,
    verifySession
  );
};
