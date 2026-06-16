import Stripe from "stripe";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const stripeWebhooks = async (req, res) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const sig = req.headers["stripe-signature"];

    console.log("\n========== WEBHOOK REQUEST ==========");
    console.log("Signature Header:", sig ? "Present" : "Missing");
    console.log(
        "Webhook Secret:",
        process.env.STRIPE_WEBHOOK_SECRET
            ? "Present"
            : "Missing"
    );
    console.log("=====================================\n");

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        console.log("\n========== WEBHOOK VERIFIED ==========");
        console.log("Event Type:", event.type);
        console.log("======================================\n");
    } catch (error) {
        console.error("\n========== WEBHOOK ERROR ==========");
        console.error(error.message);
        console.error("===================================\n");

        return res.status(400).send(
            `Webhook Error: ${error.message}`
        );
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                console.log("Checkout Session Completed");

                const session = event.data.object;

                console.log("Session ID:", session.id);
                console.log("Metadata:", session.metadata);

                const { transactionId, appId } =
                    session.metadata || {};

                if (!transactionId) {
                    console.log(
                        "Transaction ID missing in metadata"
                    );

                    return res.status(400).json({
                        success: false,
                        message:
                            "Transaction ID missing in metadata",
                    });
                }

                if (appId !== "quickgpt") {
                    console.log("Invalid App ID:", appId);

                    return res.json({
                        received: true,
                        message: "Ignored event: Invalid app",
                    });
                }

                const transaction =
                    await Transaction.findOne({
                        _id: transactionId,
                        isPaid: false,
                    });

                console.log(
                    "Transaction Found:",
                    transaction
                );

                if (!transaction) {
                    return res.json({
                        received: true,
                        message:
                            "Transaction not found or already paid",
                    });
                }

                const userUpdate =
                    await User.updateOne(
                        {
                            _id: transaction.userId,
                        },
                        {
                            $inc: {
                                credits:
                                    transaction.credits,
                            },
                        }
                    );

                console.log(
                    "User Credits Updated:",
                    userUpdate
                );

                transaction.isPaid = true;

                await transaction.save();

                console.log(
                    `Transaction ${transaction._id} marked as paid`
                );

                break;
            }

            case "payment_intent.succeeded":
                console.log(
                    "Payment Intent Succeeded"
                );
                break;

            case "charge.succeeded":
                console.log("Charge Succeeded");
                break;

            default:
                console.log(
                    "Unhandled Event Type:",
                    event.type
                );
                break;
        }

        return res.json({
            received: true,
        });
    } catch (error) {
        console.error(
            "\n========== PROCESSING ERROR =========="
        );
        console.error(error);
        console.error(
            "======================================\n"
        );

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};