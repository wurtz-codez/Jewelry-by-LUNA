import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Toast from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import Logo from '../components/Logo';
import loginBg from '../assets/login-bg2.png';
import { backgroundAnimation, overlayAnimation, errorAnimation, banModalAnimation } from '../animations/loginAnimation';
import axios from 'axios';

const API_BASE_URL = 'https://jewelry-by-luna.onrender.com/api';

const Login = () => {
  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banDetails, setBanDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        setShowToast(true);
        setTimeout(() => {
          if (result.user?.role === 'admin') {
            navigate('/admin');
          } else {
            navigate(from);
          }
        }, 1000);
      } else if (result.error === 'Account is banned') {
        setBanDetails(authError?.details);
        setShowBanModal(true);
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred during login');
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
              Welcome Back
            </h2>
            <p className="text-[#8B7355] font-cormorant text-lg">
              Please sign in to your account
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
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
                    name="email"
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white/80 border border-[#F5E6D3] rounded-xl placeholder-[#8B7355]/60 text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#2C1810]/20 focus:border-[#2C1810] transition-all duration-200 font-cormorant text-lg"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#8B7355] mb-2 font-cormorant">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-[#8B7355] group-focus-within:text-[#2C1810] transition-colors duration-200" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full pl-12 pr-12 py-4 bg-white/80 border border-[#F5E6D3] rounded-xl placeholder-[#8B7355]/60 text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#2C1810]/20 focus:border-[#2C1810] transition-all duration-200 font-cormorant text-lg"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#8B7355] hover:text-[#2C1810] transition-colors duration-200"
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <motion.div 
                className="text-[#8B7355] text-sm text-center bg-[#F5E6D3]/30 p-4 rounded-xl font-cormorant"
                {...errorAnimation}
              >
                {error}
              </motion.div>
            )}

            <div>
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
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Link 
                to="/forgot-password" 
                className="text-[#8B7355] hover:text-[#2C1810] transition-colors duration-200 font-cormorant"
              >
                Forgot password?
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
          message="Login successful"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Ban Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div 
            className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 max-w-md w-full mx-8 border border-white/20"
            {...banModalAnimation}
          >
            <div className="flex flex-col items-center">
              <div className="mb-6 p-3 rounded-full bg-[#F5E6D3]">
                <svg className="w-8 h-8 text-[#8B7355]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-cinzel font-semibold text-[#2C1810] mb-6">
                Account Banned
              </h3>
              <div className="space-y-6 text-center">
                <p className="text-[#8B7355] font-cormorant text-lg">
                  Your account has been banned from accessing the platform.
                </p>
                {banDetails?.reason && (
                  <div className="bg-[#F5E6D3]/30 p-6 rounded-xl">
                    <p className="text-sm font-medium text-[#8B7355] mb-2">Reason:</p>
                    <p className="text-[#2C1810] font-cormorant text-lg">{banDetails.reason}</p>
                  </div>
                )}
                {banDetails?.expiry && (
                  <div className="bg-[#F5E6D3]/30 p-6 rounded-xl">
                    <p className="text-sm font-medium text-[#8B7355] mb-2">Ban Expires:</p>
                    <p className="text-[#2C1810] font-cormorant text-lg">
                      {new Date(banDetails.expiry).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowBanModal(false)}
                className="mt-8 px-6 py-3 bg-[#2C1810] text-white rounded-xl hover:bg-[#2C1810]/90 transition-colors duration-200 font-cormorant"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Login;