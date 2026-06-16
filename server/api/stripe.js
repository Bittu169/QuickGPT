import Stripe from "stripe";
import getRawBody from "raw-body";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhook = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const sig = req.headers["stripe-signature"];

  let event;

  try {
    const rawBody = await getRawBody(req);

    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("🔥 WEBHOOK:", event.type);

  } catch (err) {
    console.error("❌ Stripe signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {

      case "checkout.session.completed": {
        const session = event.data.object;

        const { transactionId, appId } = session.metadata || {};

        if (!transactionId || appId !== "quickgpt") {
          console.log("⚠️ Ignored session:", session.id);
          return res.status(200).json({ received: true });
        }

        const transaction = await Transaction.findOneAndUpdate(
          { _id: transactionId, isPaid: { $ne: true } },
          { $set: { isPaid: true } },
          { new: false }
        );

        if (!transaction) {
          console.log("⚠️ Already processed or missing:", transactionId);
          return res.status(200).json({ received: true });
        }

        await User.updateOne(
          { _id: transaction.userId },
          { $inc: { credits: transaction.credits } }
        );

        console.log("✅ Credits added:", transaction.userId);
        break;
      }

      default:
        console.log("ℹ️ Unhandled event:", event.type);
    }

    return res.status(200).json({ received: true });

  } catch (err) {
    console.error("❌ Webhook processing error:", err);
    return res.status(500).json({ success: false });
  }
};