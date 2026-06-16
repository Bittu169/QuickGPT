import express from "express";
import "dotenv/config";
import cors from "cors";

import connectDB from "./configs/db.js";

import userRouter from "./routes/userRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import creditRouter from "./routes/creditRoutes.js";
import stripeRouter from "./routes/stripeRoutes.js"; // 👈 ADD THIS

const app = express();

// Connect Database
await connectDB();

// Middleware
app.use(cors());

// ⚠️ IMPORTANT: do NOT apply json globally for stripe webhook
app.use(express.json({ limit: "10mb" }));

// Routes
app.get("/", (req, res) => {
    res.send("Server is live!");
});

app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);
app.use("/api/credit", creditRouter);

// 🔥 STRIPE WEBHOOK ROUTE (MUST BE SEPARATE FILE USING express.raw)
app.use("/api/stripe", stripeRouter);

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