import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Toast from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FiMail } from 'react-icons/fi';
import Logo from '../components/Logo';
import loginBg from '../assets/login-bg2.png';
import { backgroundAnimation, overlayAnimation, errorAnimation } from '../animations/loginAnimation';
import axios from 'axios';

const API_BASE_URL = 'https://jewelry-by-luna.onrender.com/api';

const LoginOTP = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/send-login-otp`, {
        email
      });

      if (response.data.message === 'OTP sent successfully') {
        setOtpSent(true);
        startCountdown();
        setShowToast(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !otp) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await login(email, otp, true);
      
      if (result.success) {
        setShowToast(true);
        setTimeout(() => {
          if (result.user?.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }, 1000);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image with Animation */}
      <motion.div 
        className="absolute inset-0"
        {...backgroundAnimation}
        style={{
          backgroundImage: `url(${loginBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Overlay */}
      <motion.div 
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        {...overlayAnimation}
      />

      <div className="w-full max-w-[480px] px-8 py-12 relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Logo size="large" />
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white/90 backdrop-blur-sm p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-cinzel text-[#2C1810] mb-3 tracking-wide">
              Login with OTP
            </h2>
            <p className="text-[#8B7355] font-cormorant text-lg">
              Enter your email to receive an OTP
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleLogin}>
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#8B7355] mb-2 font-cormorant">
                  Email address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-[#8B7355] group-focus-within:text-[#2C1810] transition-colors duration-200" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white/80 border border-[#F5E6D3] rounded-xl placeholder-[#8B7355]/60 text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#2C1810]/20 focus:border-[#2C1810] transition-all duration-200 font-cormorant text-lg"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={otpSent}
                  />
                </div>
              </div>

              {otpSent && (
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-[#8B7355] mb-2 font-cormorant">
                    Enter OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    maxLength="6"
                    required
                    className="w-full px-4 py-4 bg-white/80 border border-[#F5E6D3] rounded-xl placeholder-[#8B7355]/60 text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#2C1810]/20 focus:border-[#2C1810] transition-all duration-200 font-cormorant text-lg tracking-widest"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              )}
            </div>

            {error && (
              <motion.div 
                className="text-[#8B7355] text-sm text-center bg-[#F5E6D3]/30 p-4 rounded-xl font-cormorant"
                {...errorAnimation}
              >
                {error}
              </motion.div>
            )}

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={isLoading || countdown > 0}
                className="w-full flex justify-center py-4 px-6 border border-transparent rounded-xl text-lg font-medium text-white bg-primary hover:bg-[#2C1810]/90 focus:outline-none focus:ring-2 focus:ring-[#2C1810]/20 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed font-cormorant tracking-wide"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending OTP...
                  </span>
                ) : countdown > 0 ? (
                  `Resend OTP in ${countdown}s`
                ) : (
                  'Send OTP'
                )}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-6 border border-transparent rounded-xl text-lg font-medium text-white bg-primary hover:bg-[#2C1810]/90 focus:outline-none focus:ring-2 focus:ring-[#2C1810]/20 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed font-cormorant tracking-wide"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Login'
                )}
              </button>
            )}

            <div className="flex items-center justify-between pt-4">
              <Link 
                to="/login" 
                className="text-[#8B7355] hover:text-[#2C1810] transition-colors duration-200 font-cormorant"
              >
                Login with password
              </Link>
              <Link 
                to="/register" 
                className="text-[#8B7355] hover:text-[#2C1810] transition-colors duration-200 font-cormorant"
              >
                Create account
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={otpSent ? "OTP sent successfully" : "Login successful"}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default LoginOTP;
