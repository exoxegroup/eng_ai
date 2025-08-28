import React, { useState, useEffect, useRef } from 'react';
import LockIcon from './icons/LockIcon';
import otpService from '../src/services/otpService';

interface OtpViewProps {
  onVerifySuccess: () => void;
}

const OTP_EXPIRATION_SECONDS = 600; // 10 minutes

const OtpView: React.FC<OtpViewProps> = ({ onVerifySuccess }) => {
  const [otp, setOtp] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (otpSent) {
      setError('Your OTP has expired. Please request a new one.');
      setOtp(''); // Invalidate the OTP
    }
  }, [timeLeft, otpSent]);

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await otpService.sendOtp('ilyas.alkali@gmail.com');
      
      if (response.success) {
        setOtpSent(true);
        setTimeLeft(OTP_EXPIRATION_SECONDS);
        setUserInput('');
        
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      } else {
        setError(response.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      setError('Failed to send OTP. Please check your connection and try again.');
      console.error('Error sending OTP:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await otpService.verifyOtp('ilyas.alkali@gmail.com', userInput);
      
      if (response.success) {
        onVerifySuccess();
      } else {
        setError(response.message || 'The OTP you entered is incorrect. Please try again.');
        setUserInput('');
      }
    } catch (error) {
      setError('Failed to verify OTP. Please check your connection and try again.');
      console.error('Error verifying OTP:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="flex items-center justify-center h-full bg-slate-50 p-8">
      <div className="w-full max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-200 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
          <LockIcon />
        </div>
        <h2 className="mt-4 text-2xl font-bold text-slate-800">Researcher Verification</h2>
        
        {!otpSent ? (
          <>
            <p className="mt-2 text-slate-600">To access this page, please verify your identity. A one-time password will be sent to your registered email address.</p>
            <button
              onClick={handleSendOtp}
              className="mt-6 w-full px-4 py-3 bg-[var(--primary-color)] text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Send Verification Code
            </button>
          </>
        ) : (
          <>
            <p className="mt-2 text-slate-600">Enter the 6-digit code we sent to your email. The code will expire in <span className="font-semibold text-slate-800">{formatTime(timeLeft)}</span>.</p>
            <form onSubmit={handleVerify} className="mt-6 space-y-4">
              <div>
                <label htmlFor="otp" className="sr-only">OTP</label>
                <input
                  ref={inputRef}
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength={6}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter 6-digit code"
                  required
                  className="w-full text-center tracking-[0.5em] text-2xl font-semibold p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  disabled={loading}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading || userInput.length !== 6}
                className="w-full px-4 py-3 bg-[var(--primary-color)] text-white text-sm font-medium rounded-lg disabled:bg-slate-400 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : 'Verify & Continue'}
              </button>
            </form>
            <button
                onClick={handleSendOtp}
                disabled={timeLeft > (OTP_EXPIRATION_SECONDS - 30)}
                className="mt-4 text-sm text-blue-600 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed"
            >
                Didn't receive a code? Resend
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OtpView;
