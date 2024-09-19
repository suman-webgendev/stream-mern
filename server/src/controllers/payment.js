import dotenv from "dotenv";
import { getUserById } from "../actions/users.js";
import { logger, stripe } from "../utils/index.js";

dotenv.config();

/**
 * Description
 * @param {Request} req
 * @param {Response} res
 * @returns {JSON}
 */

//! Returns all the plans along with prices (monthly, yearly)
export const getAllStripePlans = async (req, res) => {
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
 * Description
 * @param {Request} req
 * @param {Response} res
 * @returns {any}
 */
export const createSubscription = async (req, res) => {
  const { paymentMethodId, planId } = req.body;
  const currentUser = req.identity._id;
  try {
    const user = await getUserById(currentUser);

    if (!user.stripeCustomerId) {
      const newCustomer = await stripe.customers.create({
        payment_method: paymentMethodId,
        email: user.email,
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      user.stripeCustomerId = newCustomer.id;
      await user.save();
      logger.success("New stripe customer created!");
    }

    const subscription = await stripe.subscriptions.create({
      customer: user.stripeCustomerId,
      items: [{ price: planId }],
      expand: ["latest_invoice.payment_intent"],
    });

    await user.updateSubscription(
      "basic",
      "active",
      subscription.id,
      new Date(subscription.current_period_end * 1000)
    );
    return res.status(201).json({ subscription });
  } catch (error) {
    logger.error("[SUBSCRIPTION]: ", error);
    return res.status(500).json({ message: "Failed to create subscription." });
  }
};

/**
 * Description
 * @param {Request} req
 * @param {Response} res
 * @returns {any}
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

  // Handle the event
  switch (event.type) {
    case "invoice.payment_succeeded":
      logger.success("[PAYMENT_SUCCEEDED]");
      // Handle successful payment
      break;
    case "invoice.payment_failed":
      logger.error("[PAYMENT_FAILED]");
      // Handle payment failure
      break;
    case "customer.subscription.updated":
      logger.info("[SUBSCRIPTION_UPDATED]");
      // Handle subscription update
      break;
    default:
      logger.info(`Unhandled event type: ${event.type}`);
  }

  return res.json({ received: true });
};
