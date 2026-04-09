import express from "express";

import { handleLogin, handleVerifyToken } from "../controller/auth-controller.js";
import { sendOtp, verifyOtp } from "../controller/otp-controller.js";
import { verifyAccessToken } from "../middleware/basic-access-control.js";

const router = express.Router();

router.post("/login", handleLogin);

router.get("/verify-token", verifyAccessToken, handleVerifyToken);

// F1.1.2 – OTP email verification
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

export default router;
