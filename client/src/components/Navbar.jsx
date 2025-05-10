import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiUser, FiLogOut, FiPackage } from 'react-icons/fi'
import { FaBagShopping, FaRegHeart, FaRegUser } from 'react-icons/fa6'
import { useAuth } from '../contexts/AuthContext'
import { useShop } from '../contexts/ShopContext'
import Logo from './Logo'
import { motion, AnimatePresence } from 'framer-motion'
import { itemVariants, iconVariants, mobileMenuVariants, mobileMenuItemVariants } from '../animations/navbar'

const Navbar = ({ variant }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState('');
  const { currentUser, logout } = useAuth();
  const { cart } = useShop();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);
  const profileButtonRef = useRef(null);

  // Calculate total items in cart
  const cartItemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  // Update active link based on current location
  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/') {
      setActiveLink('Home');
    } else if (path === '/shop') {
      setActiveLink('Shop');
    } else if (path === '/about') {
      setActiveLink('About');
    } else if (path === '/contact') {
      setActiveLink('Contact');
    } else if (path === '/admin') {
      setActiveLink('Dashboard');
    }
  }, [location]);

  const handleUserClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowProfileDropdown(!showProfileDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Only close if clicking outside both the dropdown and the button
      if (
        showProfileDropdown &&
        profileDropdownRef.current && 
        !profileDropdownRef.current.contains(e.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(e.target)
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    logout();
    setShowProfileDropdown(false);
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[1000] ${variant === 'white' ? 'bg-white' : 'bg-neutral'} shadow-sm font-body`}>
      <div className="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-32">
        <div className="flex justify-between items-center h-12 sm:h-14 md:h-16">
          {/* Mobile Menu Button - Now on the left */}
          <motion.button 
            className="md:hidden text-black hover:text-primary transition-colors duration-200"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            whileHover="hover"
            whileTap="tap"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>

          {/* Left Section - Navigation Links (hidden on mobile) */}
          <motion.div 
            className="hidden md:flex items-center space-x-3 lg:space-x-5 xl:space-x-7 w-1/3 justify-start text-sm lg:text-base xl:text-lg"
            variants={itemVariants}
          >
            <Link 
              to="/" 
              className={`text-black hover:text-primary transition-colors duration-200 ${
                activeLink === 'Home' ? 'font-medium' : ''
              }`}
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Home
              </motion.span>
            </Link>
            <Link 
              to="/shop" 
              className={`text-black hover:text-primary transition-colors duration-200 ${
                activeLink === 'Shop' ? 'font-medium' : ''
              }`}
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Shop
              </motion.span>
            </Link>
            {currentUser?.role !== 'admin' && (
              <>
                <Link 
                  to="/about" 
                  className={`text-black hover:text-primary transition-colors duration-200 ${
                    activeLink === 'About' ? 'font-medium' : ''
                  }`}
                >
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    About
                  </motion.span>
                </Link>
                <Link 
                  to="/contact" 
                  className={`text-black hover:text-primary transition-colors duration-200 ${
                    activeLink === 'Contact' ? 'font-medium' : ''
                  }`}
                >
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Contact
                  </motion.span>
                </Link>
              </>
            )}
            {currentUser?.role === 'admin' && (
              <Link 
                to="/admin" 
                className={`text-black hover:text-primary transition-colors duration-200 ${
                  activeLink === 'Dashboard' ? 'font-medium' : ''
                }`}
              >
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Dashboard
                </motion.span>
              </Link>
            )}
          </motion.div>

          {/* Center Section - Logo */}
          <motion.div 
            className="w-full md:w-1/3 flex justify-center"
            variants={itemVariants}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="scale-75 sm:scale-90 md:scale-100"
            >
              <Logo size="default" />
            </motion.div>
          </motion.div>

          {/* Right Section - Icons */}
          <motion.div 
            className="flex items-center space-x-2 sm:space-x-3 md:space-x-6 lg:space-x-8 xl:space-x-12 justify-end"
            variants={itemVariants}
          >
            <motion.div
              variants={iconVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link 
                to="/wishlist" 
                aria-label="Wishlist" 
                className="text-black hover:text-primary transition-colors duration-200"
                onClick={(e) => {
                  if (!currentUser) {
                    e.preventDefault();
                    navigate('/login');
                  }
                }}
              >
                <FaRegHeart className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </Link>
            </motion.div>

            <motion.div
              variants={iconVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link 
                to="/cart" 
                aria-label="Shopping Bag" 
                className="text-black hover:text-primary transition-colors duration-200 relative"
                onClick={(e) => {
                  if (!currentUser) {
                    e.preventDefault();
                    navigate('/login');
                  }
                }}
              >
                <FaBagShopping className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                {cartItemCount > 0 && (
                  <motion.span 
                    className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[8px] sm:text-[10px] font-medium rounded-full w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            {/* Profile Dropdown - Completely rewritten */}
            <div className="relative">
              <button 
                ref={profileButtonRef}
                className="p-2 text-black hover:text-primary transition-colors duration-200 rounded-full"
                onClick={handleUserClick}
                aria-label={currentUser ? "Profile" : "Login"}
                aria-expanded={showProfileDropdown}
                aria-haspopup="true"
              >
                <FaRegUser className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </button>
              
              {showProfileDropdown && (
                <div 
                  ref={profileDropdownRef}
                  className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-[1001]"
                  style={{filter: 'drop-shadow(0 0 8px rgba(0, 0, 0, 0.1))'}}
                >
                  {currentUser ? (
                    <>
                      <div className="px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-primary-washed/20 flex items-center justify-center ring-2 ring-primary-washed/30">
                            {currentUser?.photoURL ? (
                              <img src={currentUser.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <FiUser className="w-6 h-6 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-accent text-lg">{currentUser?.name || 'User'}</p>
                            <p className="text-sm text-gray-500">{currentUser?.email || ''}</p>
                          </div>
                        </div>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-3 hover:bg-gray-100 text-base text-black transition-colors duration-200"
                          onClick={() => setShowProfileDropdown(false)}
                        >
                          <FiUser className="w-5 h-5 mr-3 text-primary/70" />
                          Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-3 text-left hover:bg-gray-100 text-base text-black transition-colors duration-200"
                        >
                          <FiLogOut className="w-5 h-5 mr-3 text-primary/70" />
                          Logout
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="px-4 py-3">
                      <Link
                        to="/login"
                        className="block w-full text-center px-4 py-2.5 text-lg text-white bg-primary hover:bg-primary-washed rounded-full transition-colors duration-200"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        Login / Signup
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            className="md:hidden bg-white border-t border-gray-200"
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
          >
            <div className="px-4 py-3 space-y-3">
              <motion.div variants={mobileMenuItemVariants}>
                <Link 
                  to="/" 
                  className="block text-base py-2 text-black hover:text-primary transition-colors duration-200"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Home
                </Link>
              </motion.div>
              <motion.div variants={mobileMenuItemVariants}>
                <Link 
                  to="/shop" 
                  className="block text-base py-2 text-black hover:text-primary transition-colors duration-200"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Shop
                </Link>
              </motion.div>
              {currentUser?.role !== 'admin' && (
                <>
                  <motion.div variants={mobileMenuItemVariants}>
                    <Link 
                      to="/about" 
                      className="block text-base py-2 text-black hover:text-primary transition-colors duration-200"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      About
                    </Link>
                  </motion.div>
                  <motion.div variants={mobileMenuItemVariants}>
                    <Link 
                      to="/contact" 
                      className="block text-base py-2 text-black hover:text-primary transition-colors duration-200"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Contact
                    </Link>
                  </motion.div>
                </>
              )}
              {currentUser?.role === 'admin' && (
                <motion.div variants={mobileMenuItemVariants}>
                  <Link 
                    to="/admin" 
                    className="block text-base py-2 text-black hover:text-primary transition-colors duration-200"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Dashboard
                  </Link>
                </motion.div>
              )}
              {currentUser ? (
                <motion.div variants={mobileMenuItemVariants}>
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left text-base py-2 text-black hover:text-primary transition-colors duration-200"
                  >
                    Logout
                  </button>
                </motion.div>
              ) : (
                <motion.div variants={mobileMenuItemVariants}>
                  <Link 
                    to="/login" 
                    className="block text-base py-2 text-black hover:text-primary transition-colors duration-200"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Login
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar