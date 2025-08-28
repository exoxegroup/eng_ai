import express from 'express';
import { OtpController } from '../controllers/OtpController';

const router = express.Router();

// POST /api/otp/send - Send OTP to email
router.post('/send', OtpController.sendOtp);

// POST /api/otp/verify - Verify OTP
router.post('/verify', OtpController.verifyOtp);

// GET /api/otp/status - Check OTP status
router.get('/status', OtpController.getOtpStatus);

export default router;