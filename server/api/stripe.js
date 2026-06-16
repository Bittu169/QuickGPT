import Stripe from "stripe";
import getRawBody from "raw-body";

import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const config = {
  api: {
    bodyParser: false, // Disables Next.js default body parser to get raw body
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const sig = req.headers["stripe-signature"];
  let event;

  // 1. Verify Webhook Signature
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("🔥 WEBHOOK RECEIVED:", event.type);
  } catch (err) {
    console.error("❌ Stripe verification error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 2. Handle Event Fulfillments
  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const transactionId = session.metadata?.transactionId;
      const appId = session.metadata?.appId;

      // Filter out unrelated checkout sessions safely
      if (!transactionId || appId !== "quickgpt") {
        return res.status(200).json({ received: true, ignored: true });
      }

      // Atomically find the transaction and mark it paid ONLY if it isn't already
      const transaction = await Transaction.findOneAndUpdate(
        { _id: transactionId, isPaid: { $ne: true } },
        { $set: { isPaid: true } },
        { new: false } // Returns the document BEFORE the update so we know if it was already paid
      );

      // If no transaction was found, it either doesn't exist OR it was already processed
      if (!transaction) {
        console.log("⚠️ Transaction already processed or missing:", transactionId);
        return res.status(200).json({ received: true });
      }

      // Now credit the user safely knowing the transaction state change was locked in
      await User.updateOne(
        { _id: transaction.userId },
        { $inc: { credits: transaction.credits } }
      );

      console.log("✅ DB UPDATED SUCCESSFULLY:", transactionId);
    }

    // Always acknowledge receipt to Stripe quickly
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Internal fulfillment error:", err);
    // Returning 500 triggers Stripe to retry later if DB dropped out
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}