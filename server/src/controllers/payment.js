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
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.CLIENT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subscription/canceled`,
    });

    return res.status(200).json({ sessionId: session.id });
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
    case "checkout.session.completed":
      const session = event.data.object;
      // Retrieve the subscription details
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription
      );

      // Update the user's subscription in your database
      const user = await getUserByStripeCustomerId(session.customer);
      if (user) {
        await user.updateSubscription(
          subscription.plan.nickname || "default",
          subscription.status,
          subscription.id,
          new Date(subscription.current_period_end * 1000)
        );
        logger.success(`Updated subscription for user ${user._id}`);
      }
      break;
    // ... handle other events
    default:
      logger.info(`Unhandled event type: ${event.type}`);
  }

  return res.json({ received: true });
};
