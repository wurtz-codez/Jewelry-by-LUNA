import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import lunaLogo from '../assets/luna-logo.png'
import { FiSearch, FiHeart, FiShoppingBag, FiUser } from 'react-icons/fi'

const Navbar = () => {
  const location = useLocation();
  const [activeLink, setActiveLink] = useState('');

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
    }
  }, [location]);

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
      </div>

      <Link to="/" className="logo">
        <img src={lunaLogo || "/placeholder.svg"} alt="Jewelry by Luna" />
        <span style={{ color: '#8B4513' }}>JEWELRY BY LUNA</span>
      </Link>

      <div className="nav-icons">
        <button aria-label="Search" style={{ color: '#8B4513' }}>
          <FiSearch />
        </button>
        <Link to="/wishlist" aria-label="Wishlist" style={{ color: '#8B4513' }}>
          <FiHeart />
        </Link>
        <Link to="/cart" aria-label="Shopping Bag" style={{ color: '#8B4513' }}>
          <FiShoppingBag />
        </Link>
        <Link to="/profile" aria-label="Account" style={{ color: '#8B4513' }}>
          <FiUser />
        </Link>
      </div>
    </nav>
  )
}

export default Navbar