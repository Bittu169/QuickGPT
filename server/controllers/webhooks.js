import { request, response } from "express";
import Stripe from "stripe";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const stripeWebhooks = async (req, res) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const sig = request.headers["stripe-signature"]
    let event;

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (error) {
        return res.status(400).send(`Webhook Error: ${error.message}`)
    }

    try {
        switch (event.type) {
            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object;
                const sessionList = await stripe.checkout.sessions.list({
                    payment_intent: paymentIntent.id,
                })
                const session = sessionList.data[0];
                const {transactionId, appId}= session.metadata;

                if(appId === "quickgpt"){
                    const traction = await Transaction.findOne({
                        _id: transactionId, isPaid: false
                    })

                    // Update credits in user accounts 
                    await User.updateOne({_id: transactionId.userId},{$inc: {credits: traction.credits}})

                    // Update credit Payment Status 
                    traction.isPaid = true
                    await traction.save()
                }else{
                    return response.json({received: true, message: "Ignored event: Invalid app"})
                }
                break;
            }
         default: console.log("Unhandles event type: ", event.type)
                break;
        }
        response.json({received: true})
    } catch (error) {
        console.log("Webhook Processing Error:", error)
        response.status(500).send("Internal Server Error")
        
    }
}