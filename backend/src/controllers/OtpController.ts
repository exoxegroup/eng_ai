import { Request, Response } from 'express';
import EmailService from '../services/EmailService';

interface OtpRequest {
  email: string;
}

interface VerifyOtpRequest {
  email: string;
  otp: string;
}

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();
const OTP_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes

export class OtpController {
  static async sendOtp(req: Request, res: Response) {
    try {
      const { email }: OtpRequest = req.body;

      if (!email || !email.includes('@')) {
        return res.status(400).json({
          success: false,
          message: 'Valid email address is required',
        });
      }

      // Check if email service is configured
      const emailConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
      if (!emailConfigured) {
        return res.status(503).json({
          success: false,
          message: 'Email service is not properly configured',
          details: 'Contact administrator to configure email settings',
        });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP with expiration
      const expiresAt = Date.now() + OTP_EXPIRATION_MS;
      otpStore.set(email, { otp, expiresAt });

      // Send OTP via email
      const emailSent = await EmailService.sendOtpEmail(email, otp);

      if (!emailSent) {
        // Clean up stored OTP if email fails
        otpStore.delete(email);
        return res.status(503).json({
          success: false,
          message: 'Failed to send OTP email',
          details: 'Email service is temporarily unavailable',
        });
      }

      // Clean up expired OTPs
      cleanupExpiredOtps();

      return res.json({
        success: true,
        message: 'OTP sent successfully to email',
        expiresIn: OTP_EXPIRATION_MS,
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    try {
      const { email, otp }: VerifyOtpRequest = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Email and OTP are required',
        });
      }

      const storedOtp = otpStore.get(email);

      if (!storedOtp) {
        return res.status(404).json({
          success: false,
          message: 'OTP not found or expired',
        });
      }

      if (Date.now() > storedOtp.expiresAt) {
        otpStore.delete(email);
        return res.status(410).json({
          success: false,
          message: 'OTP has expired',
        });
      }

      if (storedOtp.otp !== otp) {
        return res.status(401).json({
          success: false,
          message: 'Invalid OTP',
        });
      }

      // OTP is valid, remove it from store
      otpStore.delete(email);

      return res.json({
        success: true,
        message: 'OTP verified successfully',
      });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  static async getOtpStatus(req: Request, res: Response) {
    try {
      const { email } = req.query;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Email parameter is required',
        });
      }

      const storedOtp = otpStore.get(email);

      if (!storedOtp) {
        return res.json({
          success: true,
          hasActiveOtp: false,
        });
      }

      const isExpired = Date.now() > storedOtp.expiresAt;

      if (isExpired) {
        otpStore.delete(email);
        return res.json({
          success: true,
          hasActiveOtp: false,
        });
      }

      return res.json({
        success: true,
        hasActiveOtp: true,
        expiresIn: storedOtp.expiresAt - Date.now(),
      });
    } catch (error) {
      console.error('Error checking OTP status:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
}

// Helper function to clean up expired OTPs
function cleanupExpiredOtps() {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(email);
    }
  }
}

// Clean up every 5 minutes
setInterval(cleanupExpiredOtps, 5 * 60 * 1000);