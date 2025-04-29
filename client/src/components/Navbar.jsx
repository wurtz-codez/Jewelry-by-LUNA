import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import lunaLogo from '../assets/luna-logo.png'
import { FiSearch, FiHeart, FiShoppingBag, FiUser, FiLogIn, FiLogOut, FiBarChart2, FiX } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:5001/api';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState('');
  const { currentUser, logout } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

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

  // Handle click outside of search overlay
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearchIconClick = () => {
    setShowSearch(true);
    setSearchTerm('');
    setSearchResults([]);
  };

  // Real-time search as user types
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    // Add a small delay to avoid making too many requests
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const performSearch = async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/jewelry`);
      if (response.data && Array.isArray(response.data)) {
        // Filter products based on search term
        const filteredResults = response.data.filter(product => 
          product.name.toLowerCase().includes(term.toLowerCase()) || 
          product.description.toLowerCase().includes(term.toLowerCase())
        );
        setSearchResults(filteredResults);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const navigateToShopWithSearch = () => {
    navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
    setShowSearch(false);
  };

  const handleProductClick = (productId) => {
    navigate(`/shop?product=${productId}`);
    setShowSearch(false);
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
        {currentUser?.role !== 'admin' && (
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
        <button 
          aria-label="Search" 
          style={{ color: '#8B4513' }}
          onClick={handleSearchIconClick}
        >
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

      {/* Search Overlay */}
      {showSearch && (
        <div className="search-overlay">
          <div ref={searchRef} className="search-container">
            <div className="search-header">
              <h3>Search Products</h3>
              <button 
                onClick={() => setShowSearch(false)}
                className="close-search"
                aria-label="Close search"
              >
                <FiX />
              </button>
            </div>
            
            <div className="search-form">
              <div className="search-input-container">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  placeholder="Search for jewelry..."
                  autoFocus
                />
                {searchTerm && (
                  <button 
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setSearchResults([]);
                    }}
                    className="clear-search"
                    aria-label="Clear search"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </div>
            
            <div className="search-results">
              {isSearching ? (
                <p className="searching-message">Searching...</p>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="results-list">
                    {searchResults.slice(0, 5).map(product => (
                      <div 
                        key={product._id} 
                        className="search-result-item" 
                        onClick={() => handleProductClick(product._id)}
                      >
                        <div className="product-image">
                          <img 
                            src={
                              product.imageUrl.startsWith('http') 
                                ? product.imageUrl 
                                : product.imageUrl.startsWith('/uploads') 
                                  ? `http://localhost:5001${product.imageUrl}` 
                                  : `/src/assets/${product.imageUrl}`
                            } 
                            alt={product.name} 
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/src/assets/placeholder.svg';
                            }}
                          />
                        </div>
                        <div className="product-details">
                          <h4>{product.name}</h4>
                          <p className="product-price">₹{product.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {searchResults.length > 5 && (
                    <button 
                      className="view-all-results"
                      onClick={navigateToShopWithSearch}
                    >
                      View all {searchResults.length} results
                    </button>
                  )}
                </>
              ) : searchTerm && !isSearching ? (
                <p className="no-results">No products found. Try a different search term.</p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar