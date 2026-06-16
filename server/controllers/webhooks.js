import Stripe from "stripe";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        console.log("Webhook verified:", event.type);

    } catch (err) {
        console.error("Webhook signature failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {

        if (event.type === "checkout.session.completed") {

            const session = event.data.object;

            console.log("Metadata:", session.metadata);

            const transactionId = session.metadata?.transactionId;
            const appId = session.metadata?.appId;

            if (!transactionId || appId !== "quickgpt") {
                return res.json({
                    received: true,
                    message: "Invalid metadata"
                });
            }

            const transaction = await Transaction.findById(transactionId);

            if (!transaction) {
                return res.json({
                    received: true,
                    message: "Transaction not found"
                });
            }

            if (transaction.isPaid) {
                return res.json({
                    received: true,
                    message: "Already processed"
                });
            }

            await User.updateOne(
                { _id: transaction.userId },
                {
                    $inc: {
                        credits: transaction.credits
                    }
                }
            );

            transaction.isPaid = true;
            await transaction.save();

            console.log("Transaction updated:", transactionId);
        }

        return res.json({ received: true });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};