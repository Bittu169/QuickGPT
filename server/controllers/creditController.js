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
        features: [
            "100 text generations",
            "50 image generations",
            "Standard support",
            "Access to basic models",
        ],
    },
    {
        _id: "pro",
        name: "Pro",
        price: 20,
        credits: 500,
        features: [
            "500 text generations",
            "200 image generations",
            "Priority support",
            "Access to pro models",
            "Faster response time",
        ],
    },
    {
        _id: "premium",
        name: "Premium",
        price: 30,
        credits: 1000,
        features: [
            "1000 text generations",
            "500 image generations",
            "24/7 VIP support",
            "Access to premium models",
            "Dedicated account manager",
        ],
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
        console.error("Get Plans Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
            plans: [],
        });
    }
};

// PURCHASE PLAN
export const purchasePlan = async (req, res) => {
    try {
        const { planId } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        const plan = plans.find((item) => item._id === planId);

        if (!plan) {
            return res.status(400).json({
                success: false,
                message: "Invalid plan selected",
            });
        }

        // Create transaction
        const transaction = await Transaction.create({
            userId,
            planId: plan._id,
            amount: plan.price,
            credits: plan.credits,
            isPaid: false,
        });

        const origin =
            req.headers.origin ||
            process.env.CLIENT_URL ||
            "http://localhost:5173";

        // Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",

            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        unit_amount: plan.price * 100,
                        product_data: {
                            name: `${plan.name} Plan`,
                        },
                    },
                    quantity: 1,
                },
            ],

            success_url: `${origin}/loading`,
            cancel_url: `${origin}`,

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

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};