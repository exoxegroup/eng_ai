import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

interface OtpResponse {
  success: boolean;
  message: string;
  expiresIn?: number;
}

interface VerifyOtpResponse {
  success: boolean;
  message: string;
}

interface OtpStatusResponse {
  success: boolean;
  hasActiveOtp: boolean;
  expiresIn?: number;
}

class OtpService {
  private api;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async sendOtp(email: string): Promise<OtpResponse> {
    try {
      const response = await this.api.post('/otp/send', { email });
      return response.data;
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send OTP',
      };
    }
  }

  async verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
    try {
      const response = await this.api.post('/otp/verify', { email, otp });
      return response.data;
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to verify OTP',
      };
    }
  }

  async getOtpStatus(email: string): Promise<OtpStatusResponse> {
    try {
      const response = await this.api.get(`/otp/status?email=${encodeURIComponent(email)}`);
      return response.data;
    } catch (error: any) {
      console.error('Error checking OTP status:', error);
      return {
        success: false,
        hasActiveOtp: false,
      };
    }
  }
}

export default new OtpService();