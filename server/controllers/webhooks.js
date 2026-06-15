import Stripe from "stripe";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const stripeWebhooks = async (req, res) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const sig = req.headers["stripe-signature"];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        console.log("========== WEBHOOK HIT ==========");
        console.log("Event Type:", event.type);
        console.log("=================================");
    } catch (error) {
        console.error("Webhook Signature Error:", error.message);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                console.log("Checkout Session Completed");

                const session = event.data.object;

                console.log("Session ID:", session.id);
                console.log("Session Metadata:", session.metadata);

                const { transactionId, appId } = session.metadata || {};

                if (!transactionId) {
                    return res.status(400).json({
                        success: false,
                        message: "Transaction ID missing in metadata",
                    });
                }

                if (appId !== "quickgpt") {
                    return res.json({
                        received: true,
                        message: "Ignored event: Invalid app",
                    });
                }

                const transaction = await Transaction.findOne({
                    _id: transactionId,
                    isPaid: false,
                });

                console.log("Transaction Found:", transaction);

                if (!transaction) {
                    return res.json({
                        received: true,
                        message: "Transaction not found or already paid",
                    });
                }

                // Add credits to user
                await User.updateOne(
                    { _id: transaction.userId },
                    {
                        $inc: {
                            credits: transaction.credits,
                        },
                    }
                );

                // Mark transaction as paid
                transaction.isPaid = true;
                await transaction.save();

                console.log(
                    `Transaction ${transaction._id} marked as paid`
                );

                break;
            }

            case "payment_intent.succeeded":
                console.log("Payment Intent Succeeded");
                break;

            default:
                console.log("Unhandled Event Type:", event.type);
                break;
        }

        return res.json({
            received: true,
        });
    } catch (error) {
        console.error("Webhook Processing Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};