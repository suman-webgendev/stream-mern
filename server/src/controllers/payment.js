"use strict";

import dotenv from "dotenv";
import { getUserById, getUserByStripeCustomerId } from "../actions/users.js";
import { logger, stripe, subscriptionMap } from "../utils/index.js";

dotenv.config();

/**
 * Returns all the plans along with prices (monthly, yearly)
 * @param {Request} _req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const getAllStripePlans = async (_req, res) => {
  try {
    const [plans, prices] = await Promise.all([
      stripe.products.list(),
      stripe.prices.list(),
    ]);

    const plansWithPrice = {
      plans: plans.data.map((plan) => {
        const pricesOfPlan = prices.data.filter(
          (price) => price.product === plan.id
        );
        return {
          ...plan,
          prices: pricesOfPlan,
        };
      }),
    };

    return res.json(plansWithPrice);
  } catch (error) {
    logger.error("[Failed to fetch plans]: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Create a subscription for a existing customer or create customer and create subscription.
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const createSubscription = async (req, res) => {
  const { priceId } = req.body;
  const currentUser = req.identity._id;
  try {
    const user = await getUserById(currentUser);

    if (!user.stripeCustomerId) {
      const newCustomer = await stripe.customers.create({
        email: user.email,
      });

      user.stripeCustomerId = newCustomer.id;
      await user.save();
      logger.success("New stripe customer created!");
    }

    const session = await stripe.checkout.sessions.create({
      customer: user.stripeCustomerId,
      payment_method_types: ["card", "amazon_pay", "cashapp"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.CLIENT_URL}/pricing?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/pricing?status=canceled`,
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (error) {
    logger.error("[SUBSCRIPTION]: ", error);
    return res.status(500).json({
      message: "Failed to create subscription.",
      redirectUrl: `${process.env.CLIENT_URL}/pricing?status=failed`,
    });
  }
};

/**
 * This function creates webhook for stripe payment.
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    logger.error(`⚠️ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    //! Subscription started
    case "checkout.session.completed":
      logger.success("A new subscription was created");
      const session = event.data.object;

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription
      );

      const user = await getUserByStripeCustomerId(session.customer);
      if (user) {
        await user.updateSubscription(
          subscription.plan.nickname || "free",
          subscription.status,
          subscription.id,
          subscription.plan.amount
        );
        logger.success(`Updated subscription for user ${user._id}`);
      }
      break;

    //! Subscription updated
    case "customer.subscription.updated":
      const updatedSubscription = event.data.object;
      const updatedUser = await getUserByStripeCustomerId(
        updatedSubscription.customer
      );
      if (updatedUser) {
        await updatedUser.updateSubscription(
          updatedSubscription.plan.nickname || "free",
          updatedSubscription.status,
          updatedSubscription.id,
          updatedSubscription.plan.amount
        );
        logger.success(`Updated subscription for user ${updatedUser._id}`);
      }
      break;

    //! Subscription canceled
    case "customer.subscription.deleted":
      const deletedSubscription = event.data.object;
      const userWithDeletedSub = await getUserByStripeCustomerId(
        deletedSubscription.customer
      );
      if (userWithDeletedSub) {
        await userWithDeletedSub.updateSubscription(
          "free",
          "canceled",
          null,
          0
        );
        logger.success(
          `Cancelled subscription for user ${userWithDeletedSub._id}`
        );
      }
      break;

    //! Payment succeeded in every subscription interval (monthly, yearly, etc.)
    case "invoice.paid":
      console.log("Payment succeeded in every subscription interval");
      console.log(event.data.object);
      break;

    //! Payment failed due to insufficient funds or card declined in a subscription interval (monthly, yearly, etc.)
    case "invoice.payment_failed":
      console.log("Payment failed due to insufficient funds or card declined");
      console.log(event.data.object);
      break;

    default:
      logger.info(`Unhandled event type: ${event.type}`);
  }

  return res.json({ received: true });
};

/**
 * This function takes `sessionId` and `currentUserId` from `req` body and checks the `stripe` checkout session.
 * If the checkout payment status is `paid`, it update the database with the `plan`, `status` and `subscriptionId`.
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const verifySession = async (req, res) => {
  const { sessionId } = req.body;
  const currentUser = req.identity._id;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      const user = await getUserById(currentUser);

      if (!user) {
        return res.json({ verified: false });
      }
      const plan = await subscriptionMap(session.amount_total);

      await user.updateSubscription(
        plan,
        "active",
        session.subscription,
        Number(session.amount_total) / 100
      );

      await user.save();

      return res.json({ verified: true });
    } else {
      return res.json({ verified: false });
    }
  } catch (error) {
    logger.error("Error verifying session:", error);
    return res.status(500).json({ message: "Failed to verify session." });
  }
};

/**
 * Creates a Stripe billing portal session for the current user
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<Response>}
 */
export const createBillingPortalSession = async (req, res) => {
  const currentUser = req.identity._id;
  try {
    const user = await getUserById(currentUser);

    if (!user.stripeCustomerId) {
      return res
        .status(400)
        .json({ message: "User has no active subscription" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/pricing`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    logger.error("[BILLING_PORTAL]: ", error);
    return res.status(500).json({
      message: "Failed to create billing portal session.",
      redirectUrl: `${process.env.CLIENT_URL}/pricing?status=failed`,
    });
  }
};
