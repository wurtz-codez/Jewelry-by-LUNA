import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import Logo from '../components/Logo';
import registerBg from '../assets/login-bg3.png';
import { backgroundAnimation, overlayAnimation, errorAnimation, successModalAnimation } from '../animations/registerAnimation';

const Register = () => {
  const { register, error: authError } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Validate form before submission
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }
    
    try {
      const result = await register(formData.name, formData.email, formData.password);
      
      if (result.success) {
        setShowSuccessModal(true);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration');
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
          backgroundImage: `url(${registerBg})`,
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
              Create Account
            </h2>
            <p className="text-[#8B7355] font-cormorant text-lg">
              Join our exclusive jewelry collection
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#8B7355] mb-2 font-cormorant">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-[#8B7355] group-focus-within:text-[#2C1810] transition-colors duration-200" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-white/80 border border-[#F5E6D3] rounded-xl placeholder-[#8B7355]/60 text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#2C1810]/20 focus:border-[#2C1810] transition-all duration-200 font-cormorant text-lg"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>
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
                    minLength={6}
                    className="w-full pl-12 pr-12 py-4 bg-white/80 border border-[#F5E6D3] rounded-xl placeholder-[#8B7355]/60 text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#2C1810]/20 focus:border-[#2C1810] transition-all duration-200 font-cormorant text-lg"
                    placeholder="Create a password (min. 6 characters)"
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
                <p className="mt-1 text-sm text-[#8B7355] font-cormorant">
                  Password must be at least 6 characters long
                </p>
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
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            <div className="text-center pt-4">
              <p className="text-[#8B7355] font-cormorant">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-[#2C1810] hover:text-[#2C1810]/80 transition-colors duration-200"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div 
            className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 max-w-md w-full mx-8 border border-white/20"
            {...successModalAnimation}
          >
            <div className="flex flex-col items-center">
              <div className="mb-6 p-3 rounded-full bg-[#F5E6D3]">
                <svg className="w-8 h-8 text-[#8B7355]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-cinzel font-semibold text-[#2C1810] mb-6">
                Registration Successful!
              </h3>
              <p className="text-[#8B7355] font-cormorant text-lg text-center">
                Welcome to Jewelry by Luna. Your account has been created successfully.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Register;