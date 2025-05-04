import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiSearch, FiUser, FiLogOut, FiPackage } from 'react-icons/fi'
import { FaBagShopping, FaRegHeart, FaRegUser } from 'react-icons/fa6'
import { useAuth } from '../contexts/AuthContext'
import Logo from './Logo'
import Search from './Search'

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState('');
  const { currentUser, logout } = useAuth();
  const [showSearch, setShowSearch] = useState(false);

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
    if (currentUser) {
      navigate('/profile');
    }
  };

  const handleLogout = (e) => {
    e.stopPropagation();
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral shadow-sm font-body">
      <div className="max-w-8xl mx-32 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left Section - Navigation Links */}
          <div className="flex items-center space-x-7 w-1/3 justify-start  text-xl">
            <Link 
              to="/" 
              className={`text-black hover:text-primary transition-colors duration-200 ${
                activeLink === 'Home' ? 'font-medium' : ''
              }`}
            >
              Home
            </Link>
            <Link 
              to="/shop" 
              className={`text-black hover:text-primary transition-colors duration-200 ${
                activeLink === 'Shop' ? 'font-medium' : ''
              }`}
            >
              Shop
            </Link>
            {currentUser?.role !== 'admin' && (
              <>
                <Link 
                  to="/about" 
                  className={`text-black hover:text-primary transition-colors duration-200 ${
                    activeLink === 'About' ? 'font-medium' : ''
                  }`}
                >
                  About
                </Link>
                <Link 
                  to="/contact" 
                  className={`text-black hover:text-primary transition-colors duration-200 ${
                    activeLink === 'Contact' ? 'font-medium' : ''
                  }`}
                >
                  Contact
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
                Dashboard
              </Link>
            )}
          </div>

          {/* Center Section - Logo */}
          <div className="w-1/3 flex justify-center">
            <Logo size="default" />
          </div>

          {/* Right Section - Icons */}
          <div className="flex items-center space-x-16 w-1/3 justify-end">
            <button 
              aria-label="Search" 
              className="text-black hover:text-primary transition-colors duration-200"
              onClick={() => setShowSearch(true)}
            >
              <FiSearch className="w-5 h-5" />
            </button>

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
              <FaRegHeart className="w-5 h-5" />
            </Link>
            
            <Link 
              to="/cart" 
              aria-label="Shopping Bag" 
              className="text-black hover:text-primary transition-colors duration-200"
              onClick={(e) => {
                if (!currentUser) {
                  e.preventDefault();
                  navigate('/login');
                }
              }}
            >
              <FaBagShopping className="w-5 h-5" />
            </Link>
            
            <div className="relative group">
              <button 
                onClick={handleUserClick}
                aria-label={currentUser ? "Profile" : "Login"}
                className="text-black hover:text-primary transition-colors duration-200"
              >
                <FaRegUser className="w-5 h-5" />
              </button>
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 delay-100 hover:opacity-100 hover:visible border border-neutral/20">
                {currentUser ? (
                  <>
                    <div className="px-4 py-3 border-b border-neutral/20">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-primary-washed/20 flex items-center justify-center ring-2 ring-primary-washed/30">
                          {currentUser.photoURL ? (
                            <img src={currentUser.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <FiUser className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-accent text-lg">{currentUser.displayName || 'User'}</p>
                          <p className="text-sm text-gray-500">{currentUser.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2.5 text-base text-black hover:bg-neutral/50 transition-colors duration-200"
                      >
                        <FiUser className="w-5 h-5 mr-3 text-primary/70" />
                        Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center px-4 py-2.5 text-base text-black hover:bg-neutral/50 transition-colors duration-200"
                      >
                        <FiPackage className="w-5 h-5 mr-3 text-primary/70" />
                        Your Orders
                      </Link>
                      <button
                        onClick={handleLogout}
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
                    >
                      Login / Signup
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Search isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </nav>
  )
}

export default Navbar