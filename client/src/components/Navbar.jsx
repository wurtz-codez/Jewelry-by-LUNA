import { useState } from 'react'
import lunaLogo from '../assets/luna-logo.png'
import { FiSearch, FiHeart, FiShoppingBag, FiUser } from 'react-icons/fi'

const Navbar = () => {
  const [activeLink, setActiveLink] = useState('Home')

  return (
    <nav className="navbar">
      <div className="nav-links">
        <a 
          href="" 
          className={activeLink === 'Home' ? 'active' : ''}
          onClick={() => setActiveLink('Home')}
        >
          Home
        </a>
        <a 
          href="./shop" 
          className={activeLink === 'Shop' ? 'active' : ''}
          onClick={() => setActiveLink('Shop')}
        >
          Shop
        </a>
        <a 
          href="#" 
          className={activeLink === 'About' ? 'active' : ''}
          onClick={() => setActiveLink('About')}
        >
          About
        </a>
        <a 
          href="#" 
          className={activeLink === 'Contact' ? 'active' : ''}
          onClick={() => setActiveLink('Contact')}
        >
          Contact
        </a>
      </div>

      <div className="logo">
        <img src={lunaLogo || "/placeholder.svg"} alt="Jewelry by Luna" />
        <span>JEWELRY BY LUNA</span>
      </div>

      <div className="nav-icons">
        <button aria-label="Search">
          <FiSearch />
        </button>
        <button aria-label="Wishlist">
          <FiHeart />
        </button>
        <button aria-label="Shopping Bag">
          <FiShoppingBag />
        </button>
        <button aria-label="Account">
          <FiUser />
        </button>
      </div>
    </nav>
  )
}

export default Navbar