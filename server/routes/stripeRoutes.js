import express from "express";
import { stripeWebhook } from "../controllers/stripeController.js";

const router = express.Router();

// ⚠️ RAW BODY ONLY HERE
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

export default router;