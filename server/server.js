import express from "express";
import "dotenv/config";
import cors from "cors";

import connectDB from "./configs/db.js";

import userRouter from "./routes/userRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import creditRouter from "./routes/creditRoutes.js";

import { stripeWebhooks } from "./controllers/webhooks.js";

const app = express();

// Connect Database
await connectDB();

// Stripe Webhook Route
// MUST be before express.json()
app.post(
    "/api/stripe",
    express.raw({ type: "application/json" }),
    stripeWebhooks
);

// Middleware
app.use(cors());

app.use(express.json({
    limit: "10mb"
}));

// Routes
app.get("/", (req, res) => {
    res.send("Server is live!");
});

app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);
app.use("/api/credit", creditRouter);

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(500).json({
        success: false,
        message: err.message,
    });
});

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});