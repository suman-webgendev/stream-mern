"use strict";

import dotenv from "dotenv";
import express from "express";
import { getUserById, getUserByStripeCustomerId } from "../actions/users.js";
import { logger, stripe, subscriptionMap } from "../utils/index.js";

dotenv.config();

/**
 * Returns all the plans along with prices (monthly, yearly).
 *
 * @param {express.Request} req - The incoming request object.
 * @param {express.Response} res - The outgoing response object.
 * @returns {Promise<express.Response>} - A Promise that resolves to the response object.
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
 *
 * @param {express.Request} req - The incoming request object.
 * @param {express.Response} res - The outgoing response object.
 * @returns {Promise<express.Response>} - A Promise that resolves to the response object.
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
 * This function creates webhook for stripe payment. It retrieves the `stripe signature` and then uses it to verify the `webhook request`. If the request is valid, it processes the event and updates the database accordingly. It checks the event type and handles each case accordingly. It handles the following events:
 * - `checkout.session.completed`: When a new subscription is created.
 * - `customer.subscription.updated`: When a subscription is updated.
 * - `customer.subscription.deleted`: When a subscription is canceled.
 * - `invoice.payment_failed`: When a payment fails due to insufficient funds or card declined.
 * - `invoice.payment_succeeded`: When a payment succeeds.
 * - `invoice.created`: When an invoice is created.
 * - `invoice.finalized`: When an invoice is finalized.
 * - `invoice.updated`: When an invoice is updated.
 * - `invoice.paid`: When an invoice is paid.
 * - `payment_intent.created`: When a payment intent is created.
 * - `payment_intent.succeeded`: When a payment intent is succeeded.
 * - `payment_method.attached`: When a payment method is attached.
 * - `charge.succeeded`: When a charge is succeeded.
 * - `customer.subscription.created`: When a subscription is created.
 *
 * To run this webhook on local system, install `stripe-cli` and login to your stripe account. Then, run the following command:
 * ```bash
 * stripe listen --forward-to localhost:8080/api/subscriptions/webhook
 * ```
 * For production, just add the `webhook url` to `https://<your_api_url>/api/subscriptions/webhook` to the stripe webhook settings.
 *
 * @param {express.Request} req - The incoming request object.
 * @param {express.Response} res - The outgoing response object.
 * @returns {Promise<express.Response>} - A Promise that resolves to the response object.
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

  try {
    switch (event.type) {
      //! Subscription started
      case "checkout.session.completed": {
        logger.success("A new subscription was created");
        const session = event.data.object;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription
        );
        const user = await getUserByStripeCustomerId(session.customer);

        if (user) {
          await user.updateSubscription(
            await subscriptionMap(subscription.plan.amount_total),
            subscription.status,
            subscription.id,
            Number(subscription.plan.amount) / 100,
            new Date(subscription.current_period_end * 1000)
          );
          logger.success(`Updated subscription for user ${user._id}`);
        }
        break;
      }

      //! Subscription updated
      case "customer.subscription.updated":
        {
          const updatedSubscription = event.data.object;
          const updatedUser = await getUserByStripeCustomerId(
            updatedSubscription.customer
          );
          const previousStatus = updatedSubscription.status;

          if (updatedUser) {
            logger.info(
              "Subscription update event received:",
              JSON.stringify(updatedSubscription, null, 2)
            );

            if (
              updatedSubscription.status === "canceled" ||
              updatedSubscription.cancel_at_period_end
            ) {
              logger.info(
                "Cancelled subscription or scheduled for cancellation"
              );
              await updatedUser.updateSubscription(
                "free",
                updatedSubscription.cancel_at_period_end
                  ? "active"
                  : "canceled",
                null,
                0,
                updatedSubscription.cancel_at_period_end
                  ? new Date(updatedSubscription.current_period_end * 1000)
                  : null
              );
              logger.success(
                `Cancelled subscription for user ${updatedUser._id} (cancel_at_period_end: ${updatedSubscription.cancel_at_period_end})`
              );
            } else {
              logger.success("Updated subscription");
              await updatedUser.updateSubscription(
                await subscriptionMap(updatedSubscription.plan.amount_total),
                updatedSubscription.status,
                updatedSubscription.id,
                Number(updatedSubscription.plan.amount) / 100,
                new Date(updatedSubscription.current_period_end * 1000)
              );
              logger.success(
                `Updated subscription for user ${updatedUser._id} from ${previousStatus} to ${updatedSubscription.status}`
              );
            }
          }
        }
        break;

      //! Subscription canceled
      case "customer.subscription.deleted":
        {
          const deletedSubscription = event.data.object;
          const user = await getUserByStripeCustomerId(
            deletedSubscription.customer
          );

          if (user) {
            console.log(
              "Subscription deleted event received:",
              JSON.stringify(deletedSubscription, null, 2)
            );
            await user.updateSubscription("free", "canceled", null, 0, null);
            logger.success(
              `Cancelled subscription for user ${user._id} due to deletion`
            );
          }
        }
        break;

      //! Subscription created
      case "customer.subscription.created":
        logger.info(`Subscription created: ${event.data.object.id}`);
        break;

      //! Charge succeeded
      case "charge.succeeded":
        logger.info(
          `Charge succeeded for ${event.data.object.amount / 100} ${
            event.data.object.currency
          }`
        );
        break;

      case "billing_portal.session.created":
        logger.info(`Billing portal session created: ${event.data.object.id}`);
        break;

      //! Payment method attached
      case "payment_method.attached":
        logger.info(`Payment method attached: ${event.data.object.id}`);
        break;

      //! Payment intent created
      case "payment_intent.created":
        logger.info(`Payment intent created: ${event.data.object.id}`);
        break;

      //! Payment intent succeeded
      case "payment_intent.succeeded":
        logger.info(`Payment intent succeeded: ${event.data.object.id}`);
        break;

      //! Invoice created
      case "invoice.created":
        logger.info(`Invoice created: ${event.data.object.id}`);
        break;

      //! Invoice finalized
      case "invoice.finalized":
        logger.info(`Invoice finalized: ${event.data.object.id}`);
        break;

      //! Invoice updated
      case "invoice.updated":
        logger.info(`Invoice updated: ${event.data.object.id}`);
        break;

      //! Invoice paid
      case "invoice.paid":
        logger.info(`Invoice paid: ${event.data.object.id}`);
        break;

      //! Payment succeeded (Alternative handling)
      case "invoice.payment_succeeded":
        logger.info(`Invoice payment succeeded for: ${event.data.object.id}`);
        break;

      //! Payment failed in a subscription interval (monthly, yearly, etc.)
      case "invoice.payment_failed":
        logger.error(
          "Payment failed due to insufficient funds or card declined"
        );
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    logger.error(`Error processing event ${event.type}: ${error.message}`);
    return res.status(500).send("Webhook handler failed");
  }

  return res.json({ received: true });
};

/**
 * This function takes `sessionId` and `currentUserId` from `req` body and checks the `stripe` checkout session.
 * If the checkout payment status is `paid`, it update the database with the `plan`, `status` and `subscriptionId`.
 *
 * @param {express.Request} req - The incoming request object.
 * @param {express.Response} res - The outgoing response object.
 * @returns {Promise<express.Response>} - A Promise that resolves to the response object.
 */
export const verifySession = async (req, res) => {
  const { sessionId, subscriptionId } = req.body;
  const currentUser = req.identity._id;

  try {
    const user = await getUserById(currentUser);
    if (!user) {
      return res.json({ verified: false });
    }

    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === "paid") {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription
        );

        const plan = await subscriptionMap(session.amount_total);
        const subscriptionEndDate = new Date(
          subscription.current_period_end * 1000
        );

        await user.updateSubscription(
          plan,
          "active",
          session.subscription,
          Number(session.amount_total) / 100,
          subscriptionEndDate
        );

        await user.save();
        logger.success(
          "Subscription updated successfully for user " + user._id
        );

        return res.json({ verified: true });
      } else {
        return res.json({ verified: false });
      }
    }
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const plan = await subscriptionMap(subscription.plan.amount);
      const subscriptionEndDate = new Date(
        subscription.current_period_end * 1000
      );

      await user.updateSubscription(
        plan,
        "active",
        subscription.id,
        Number(subscription.plan.amount) / 100,
        subscriptionEndDate
      );

      await user.save();

      logger.success("Subscription updated successfully for user " + user._id);
      return res.json({ verified: true });
    }
    return res.json({ verified: false });
  } catch (error) {
    logger.error("Error verifying session:", error);
    return res.status(500).json({ message: "Failed to verify session." });
  }
};

/**
 * Creates a Stripe billing portal session for the current user.
 *
 * @param {express.Request} req - The incoming request object.
 * @param {express.Response} res - The outgoing response object.
 * @returns {Promise<express.Response>} - A Promise that resolves to the response object.
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

//*---------------------------------------Custom Checkout Form----------------------------------

/**
 * Creates a PaymentIntent for a customer.
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @returns {Promise<express.Response>}
 */
export const createPaymentIntent = async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      customer: req.identity.stripeCustomerId,
      amount: 1000,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    });
    res.status(201).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    logger.error("[PAYMENT_INTENT]: ", err);
    return res.status(500).json({
      message: "Failed to create payment intent.",
      redirectUrl: `${process.env.CLIENT_URL}/pricing?status=failed`,
    });
  }
};

/**
 * This functions create a checkout session for a customer using token received from user. It also retrieves the priceId from the request body.
 * It then creates a checkout session for the customer and returns the subscription object.
 *
 * @param {express.Request} req - The incoming request object.
 * @param {express.Response} res - The outgoing response object.
 * @returns {Promise<express.Response>} - A Promise that resolves to the response object.
 */
export const createCheckoutSession = async (req, res) => {
  const { token, priceId } = req.body;
  const currentUser = req.identity._id;

  try {
    if (!token || !priceId)
      return res
        .status(400)
        .json({ message: "Please fill all the required fields" });

    if (!currentUser)
      return res.status(401).json({ message: "Please login first" });
    const user = await getUserById(currentUser);

    if (!user) return res.status(404).json({ message: "User not found!" });

    if (!user.stripeCustomerId) {
      const newCustomer = await stripe.customers.create({
        email: user.email,
      });

      user.stripeCustomerId = newCustomer.id;
      await user.save();
      logger.success("New stripe customer created!");
    }

    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: { token: token.id },
    });

    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: user.stripeCustomerId,
    });

    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethod.id,
      },
    });

    const subscription = await stripe.subscriptions.create({
      customer: user.stripeCustomerId,
      items: [{ price: priceId }],
      default_payment_method: paymentMethod.id,
    });

    logger.success(
      "A new subscription was created successfully using custom checkout form!"
    );

    return res.status(201).json({
      success: true,
      subscription,
    });
  } catch (error) {
    logger.error("[CHECKOUT_SESSION]: ", error);

    return res.status(400).json({
      message: error.message,
    });
  }
};

/**
 * This function returns the stripe publishable key to the client.
 *
 * @param {express.Request} req - The incoming request object.
 * @param {express.Response} res - The outgoing response object.
 * @returns {Promise<express.Response>} - A Promise that resolves to the response object.
 */
export const getStripePublishableKey = async (req, res) => {
  try {
    const publishableKey = process.env.STRIPE_PUBLISH_KEY;
    return res.status(200).json({ publishableKey });
  } catch (error) {
    logger.error("[STRIPE_PUBLISHABLE_KEY]: ", error);
    return res.status(500).json({
      message: "Failed to get stripe publishable key.",
    });
  }
};
