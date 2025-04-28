import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import lunaLogo from '../assets/luna-logo.png'
import { FiSearch, FiHeart, FiShoppingBag, FiUser, FiLogIn, FiLogOut, FiBarChart2 } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState('');
  const { currentUser, logout } = useAuth();

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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-links">
        <Link 
          to="/" 
          className={activeLink === 'Home' ? 'active' : ''}
          style={{ color: '#8B4513' }}
        >
          Home
        </Link>
        <Link 
          to="/shop" 
          className={activeLink === 'Shop' ? 'active' : ''}
          style={{ color: '#8B4513' }}
        >
          Shop
        </Link>
        {!currentUser?.role === 'admin' && (
          <>
            <Link 
              to="/about" 
              className={activeLink === 'About' ? 'active' : ''}
              style={{ color: '#8B4513' }}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={activeLink === 'Contact' ? 'active' : ''}
              style={{ color: '#8B4513' }}
            >
              Contact
            </Link>
          </>
        )}
        {currentUser?.role === 'admin' && (
          <Link 
            to="/admin" 
            className={activeLink === 'Dashboard' ? 'active' : ''}
            style={{ color: '#8B4513' }}
          >
            Dashboard
          </Link>
        )}
      </div>

      <Link to="/" className="logo">
        <img src={lunaLogo || "/placeholder.svg"} alt="Jewelry by Luna" />
        <span style={{ color: '#8B4513' }}>JEWELRY BY LUNA</span>
      </Link>

      <div className="nav-icons">
        <button aria-label="Search" style={{ color: '#8B4513' }}>
          <FiSearch />
        </button>
        
        {currentUser ? (
          <>
            {currentUser.role !== 'admin' && (
              <>
                <Link to="/wishlist" aria-label="Wishlist" style={{ color: '#8B4513' }}>
                  <FiHeart />
                </Link>
                <Link to="/cart" aria-label="Shopping Bag" style={{ color: '#8B4513' }}>
                  <FiShoppingBag />
                </Link>
              </>
            )}
            <Link to="/profile" aria-label="Account" style={{ color: '#8B4513' }}>
              <FiUser />
            </Link>
            <button 
              onClick={handleLogout} 
              aria-label="Logout" 
              style={{ color: '#8B4513' }}
              className="ml-2"
            >
              <FiLogOut />
            </button>
          </>
        ) : (
          <Link to="/login" aria-label="Login" style={{ color: '#8B4513' }}>
            <FiLogIn />
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navbar