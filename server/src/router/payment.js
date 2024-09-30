"use strict";

import {
  createBillingPortalSession,
  createCheckoutSession,
  createPaymentIntent,
  createSubscription,
  getAllStripePlans,
  getStripePublishableKey,
  stripeWebhook,
  verifySession,
} from "@/controllers/payment";
import { isAuthenticated } from "@/middlewares";
import { rateLimiter } from "@/utils";
import express, { Router } from "express";

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
    rateLimiter(10, 100),
    getAllStripePlans
  );

  //? Verify after completing a payment
  router.post(
    "/api/subscription/verify-session",
    isAuthenticated,
    rateLimiter(),
    verifySession
  );

  //? Create a Stripe billing portal session
  router.post(
    "/api/subscription/billing-portal",
    isAuthenticated,
    rateLimiter(),
    createBillingPortalSession
  );

  //? Get stripe publishable key
  router.get(
    "/api/subscription/get-stripe-publishable-key",
    isAuthenticated,
    rateLimiter(10, 100),
    getStripePublishableKey
  );

  //*---------------------------------Custom Checkout Form------------------------------------

  router.post(
    "/api/subscription/create-payment-intent",
    isAuthenticated,
    rateLimiter(),
    createPaymentIntent
  );

  router.post(
    "/api/subscription/checkout",
    isAuthenticated,
    rateLimiter(),
    createCheckoutSession
  );
};
