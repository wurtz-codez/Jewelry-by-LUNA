import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const Search = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Handle click outside of search overlay
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

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
    onClose();
  };

  const handleProductClick = (productId) => {
    navigate(`/shop?product=${productId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="search-overlay">
      <div ref={searchRef} className="search-container">
        <div className="search-header">
          <h3>Search Products</h3>
          <button 
            onClick={onClose}
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
                      <div className="product-price">
                        <span className="selling-price">₹{product.sellingPrice.toFixed(2)}</span>
                        {product.discount > 0 && (
                          <>
                            <span className="original-price">₹{product.price.toFixed(2)}</span>
                            <span className="discount-badge">Save ₹{product.discount.toFixed(2)}</span>
                          </>
                        )}
                      </div>
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
  );
};

export default Search; 