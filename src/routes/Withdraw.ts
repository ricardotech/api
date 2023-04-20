import "dotenv/config";
import express from "express";
import { rateLimit } from "express-rate-limit";

const limitReqPerHour = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 10,
  message: "Too many requests, please try again later.",
});

const router = express.Router();

import { getWithdrawsByUserId, requestWithdraw, verifyWithdraw2F } from "../controllers/withdraw";

router.post("/", limitReqPerHour, requestWithdraw);
router.post("/2f", limitReqPerHour, verifyWithdraw2F);
router.get("/:courseId", getWithdrawsByUserId);
// router.get("/history", getUserWithdrawHistory);
// router.put("/status/:id", updateWithdrawStatus);

export default router;