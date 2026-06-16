import Transaction from "../models/Transaction.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Plan data
const plans = [
    {
        _id: "basic",
        name: "Basic",
        price: 10,
        credits: 100,
    },
    {
        _id: "pro",
        name: "Pro",
        price: 20,
        credits: 500,
    },
    {
        _id: "premium",
        name: "Premium",
        price: 30,
        credits: 1000,
    },
];

// GET ALL PLANS
export const getPlans = async (req, res) => {
    try {
        return res.json({
            success: true,
            plans,
        });
    } catch (error) {
        return res.json({
            success: false,
            message: error.message,
        });
    }
};

// PURCHASE PLAN (CREATE STRIPE SESSION)
export const purchasePlan = async (req, res) => {
    try {
        const { planId } = req.body;
        const userId = req.user?._id;

        // Validate user
        if (!userId) {
            return res.json({
                success: false,
                message: "User not authenticated",
            });
        }

        // Find plan
        const plan = plans.find((p) => p._id === planId);

        if (!plan) {
            return res.json({
                success: false,
                message: "Invalid plan selected",
            });
        }

        // Create transaction in DB
        const transaction = await Transaction.create({
            userId,
            planId: plan._id,
            amount: plan.price,
            credits: plan.credits,
            isPaid: false,
        });

        const origin = req.headers.origin || "http://localhost:5173";

        // Create Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",

            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        unit_amount: plan.price * 100,
                        product_data: {
                            name: plan.name,
                        },
                    },
                    quantity: 1,
                },
            ],

            success_url: `${origin}/loading`,
            cancel_url: `${origin}`,

            // IMPORTANT: must match webhook logic
            metadata: {
                transactionId: transaction._id.toString(),
                appId: "quickgpt",
            },
        });

        return res.json({
            success: true,
            url: session.url,
        });

    } catch (error) {
        console.error("Purchase Plan Error:", error);

        return res.json({
            success: false,
            message: error.message,
        });
    }
};