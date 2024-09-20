"use strict";

import express, { Router } from "express";
import {
  createSubscription,
  getAllStripePlans,
  stripeWebhook,
  verifySession,
} from "../controllers/payment.js";
import { isAuthenticated } from "../middlewares/index.js";
import { rateLimiter } from "../utils/index.js";

/**
 * @param {Router} router
 */

export default (router) => {
  //? Create subscription
  router.post(
    "/api/subscriptions",
    isAuthenticated,
    rateLimiter(),
    createSubscription
  );

  router.post(
    "/api/subscriptions/webhook",
    express.raw({ type: "application/json" }),
    stripeWebhook
  );

  //? Returns all the plans along with the prices
  router.get(
    "/api/subscription/plans",
    isAuthenticated,
    rateLimiter(),
    getAllStripePlans
  );

  //? Verify after completing a payment
  router.post(
    "/api/subscription/verify-session",
    isAuthenticated,
    rateLimiter(),
    verifySession
  );
};
