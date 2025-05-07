import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiSearch, FiUser, FiLogOut, FiPackage } from 'react-icons/fi'
import { FaBagShopping, FaRegHeart, FaRegUser } from 'react-icons/fa6'
import { useAuth } from '../contexts/AuthContext'
import { useShop } from '../contexts/ShopContext'
import Logo from './Logo'
import Search from './Search'
import { motion, AnimatePresence } from 'framer-motion'
import { itemVariants, iconVariants, mobileMenuVariants, mobileMenuItemVariants } from '../animations/navbar'

const Navbar = ({ variant }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState('');
  const { currentUser, logout } = useAuth();
  const { cart } = useShop();
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

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

  const handleUserClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const handleLogout = (e) => {
    e.stopPropagation();
    logout();
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${variant === 'white' ? 'bg-white' : 'bg-neutral'} shadow-sm font-body`}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-32">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Left Section - Navigation Links */}
          <motion.div 
            className="hidden md:flex items-center space-x-4 lg:space-x-7 w-1/3 justify-start text-lg lg:text-xl"
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
            className="w-full md:w-1/3 flex justify-start md:justify-center"
            variants={itemVariants}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Logo size="default" />
            </motion.div>
          </motion.div>

          {/* Right Section - Icons */}
          <motion.div 
            className="flex items-center space-x-4 md:space-x-8 lg:space-x-16 w-full md:w-1/3 justify-end"
            variants={itemVariants}
          >
            <motion.button 
              aria-label="Search" 
              className="text-black hover:text-primary transition-colors duration-200"
              onClick={() => setShowSearch(true)}
              variants={iconVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <FiSearch className="w-5 h-5" />
            </motion.button>

            <motion.div
              variants={iconVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link 
                to="/wishlist" 
                aria-label="Wishlist" 
                className="hidden md:block text-black hover:text-primary transition-colors duration-200"
                onClick={(e) => {
                  if (!currentUser) {
                    e.preventDefault();
                    navigate('/login');
                  }
                }}
              >
                <FaRegHeart className="w-5 h-5" />
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
                <FaBagShopping className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <motion.span 
                    className="absolute -top-2 -right-2 bg-primary text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </Link>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.button 
              className="md:hidden text-black hover:text-primary transition-colors duration-200"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              whileHover="hover"
              whileTap="tap"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>

            {/* Desktop Profile Dropdown */}
            <motion.div 
              className="hidden md:block relative profile-dropdown"
            >
              <button 
                onClick={handleUserClick}
                aria-label={currentUser ? "Profile" : "Login"}
                className="text-black hover:text-primary transition-colors duration-200"
              >
                <FaRegUser className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {showProfileDropdown && (
                  <motion.div 
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 border border-neutral/20"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {currentUser ? (
                      <>
                        <div className="px-4 py-3 border-b border-neutral/20">
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
                            className="flex items-center px-4 py-2.5 text-base text-black hover:bg-neutral/50 transition-colors duration-200"
                            onClick={() => setShowProfileDropdown(false)}
                          >
                            <FiUser className="w-5 h-5 mr-3 text-primary/70" />
                            Profile
                          </Link>
                          <button
                            onClick={(e) => {
                              handleLogout(e);
                              setShowProfileDropdown(false);
                            }}
                            className="flex items-center w-full px-4 py-2.5 text-base text-black hover:bg-neutral/50 transition-colors duration-200"
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
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div 
              className="md:hidden"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <motion.div className="py-4 space-y-2">
                <motion.div variants={mobileMenuItemVariants}>
                  <Link 
                    to="/" 
                    className={`block px-4 py-2 text-black hover:text-primary transition-colors duration-200 ${
                      activeLink === 'Home' ? 'font-medium' : ''
                    }`}
                  >
                    Home
                  </Link>
                </motion.div>
                <motion.div variants={mobileMenuItemVariants}>
                  <Link 
                    to="/shop" 
                    className={`block px-4 py-2 text-black hover:text-primary transition-colors duration-200 ${
                      activeLink === 'Shop' ? 'font-medium' : ''
                    }`}
                  >
                    Shop
                  </Link>
                </motion.div>
                {currentUser?.role !== 'admin' && (
                  <>
                    <motion.div variants={mobileMenuItemVariants}>
                      <Link 
                        to="/about" 
                        className={`block px-4 py-2 text-black hover:text-primary transition-colors duration-200 ${
                          activeLink === 'About' ? 'font-medium' : ''
                        }`}
                      >
                        About
                      </Link>
                    </motion.div>
                    <motion.div variants={mobileMenuItemVariants}>
                      <Link 
                        to="/contact" 
                        className={`block px-4 py-2 text-black hover:text-primary transition-colors duration-200 ${
                          activeLink === 'Contact' ? 'font-medium' : ''
                        }`}
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
                      className={`block px-4 py-2 text-black hover:text-primary transition-colors duration-200 ${
                        activeLink === 'Dashboard' ? 'font-medium' : ''
                      }`}
                    >
                      Dashboard
                    </Link>
                  </motion.div>
                )}
                <motion.div variants={mobileMenuItemVariants}>
                  <Link 
                    to="/wishlist" 
                    className={`block px-4 py-2 text-black hover:text-primary transition-colors duration-200 ${
                      activeLink === 'Wishlist' ? 'font-medium' : ''
                    }`}
                    onClick={(e) => {
                      if (!currentUser) {
                        e.preventDefault();
                        navigate('/login');
                      }
                    }}
                  >
                    Wishlist
                  </Link>
                </motion.div>
                {currentUser ? (
                  <>
                    <motion.div variants={mobileMenuItemVariants}>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-black hover:text-primary transition-colors duration-200"
                      >
                        Profile
                      </Link>
                    </motion.div>
                    <motion.div variants={mobileMenuItemVariants}>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-black hover:text-primary transition-colors duration-200"
                      >
                        Logout
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <motion.div variants={mobileMenuItemVariants}>
                    <Link
                      to="/login"
                      className="block px-4 py-2 text-black hover:text-primary transition-colors duration-200"
                    >
                      Login / Signup
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Search isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </nav>
  )
}

export default Navbar