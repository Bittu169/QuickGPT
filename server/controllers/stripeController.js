import Stripe from "stripe";
import getRawBody from "raw-body";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhook = async (req, res) => {
    // Stripe requires raw body
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

        console.log("🔥 WEBHOOK RECEIVED:", event.type);

    } catch (err) {
        console.error("❌ Stripe signature error:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {

            case "checkout.session.completed": {
                const session = event.data.object;

                console.log("📦 SESSION METADATA:", session.metadata);

                const transactionId = session.metadata?.transactionId;
                const appId = session.metadata?.appId;

                // validate metadata
                if (!transactionId || appId !== "quickgpt") {
                    console.log("⚠️ Invalid metadata - ignoring webhook");
                    return res.status(200).json({ received: true });
                }

                // STEP 1: update transaction safely
                const transaction = await Transaction.findOneAndUpdate(
                    {
                        _id: transactionId,
                        isPaid: false // prevents double processing
                    },
                    {
                        $set: { isPaid: true }
                    },
                    { new: true }
                );

                if (!transaction) {
                    console.log("❌ Transaction not found or already paid:", transactionId);
                    return res.status(200).json({ received: true });
                }

                console.log("✅ Transaction marked paid:", transaction._id);

                // STEP 2: add credits to user
                await User.findByIdAndUpdate(
                    transaction.userId,
                    {
                        $inc: { credits: transaction.credits }
                    }
                );

                console.log(
                    "💰 Credits added:",
                    transaction.userId,
                    transaction.credits
                );

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