import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiSearch, FiShoppingCart, FiStar, FiLoader, FiRefreshCw } from 'react-icons/fi';
import bannerImage from '../assets/Shop-page-banner.png';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const Shop = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 30000]); // Set higher default maximum
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fetch products from the backend API
  useEffect(() => {
    fetchProducts();
  }, []);
  
  // Refresh products function
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/jewelry`);
      
      if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
        setFilteredProducts(response.data);
        setError('');
      } else {
        setError('Received invalid data format from server');
      }
    } catch (err) {
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Filter products based on search, category, and price
  useEffect(() => {
    if (products.length === 0) return;
    
    let result = products;
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Filter by price range
    result = result.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, priceRange, products]);
  
  // Handle adding to cart (would connect to state management in a real app)
  const handleAddToCart = (product) => {
    // Here you would typically dispatch an action to add the item to cart
  };
  
  // Check if price range is appropriate for products
  useEffect(() => {
    if (products.length > 0) {
      const maxProductPrice = Math.max(...products.map(p => p.price));
      
      // If our price range maximum is less than the highest priced product
      if (maxProductPrice > priceRange[1]) {
        setPriceRange([priceRange[0], maxProductPrice + 1000]); // Add some buffer
      }
    }
  }, [products]);
  
  return (
    <div className="shop-page">
      <Navbar />
      
      {/* Shop Banner */}
      <div className="shop-banner">
        <img src={bannerImage} alt="Jewelry Collection" />
      </div>
      
      {/* Search and Filters */}
      <div className="shop-controls">
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search for jewelry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="clear-search"
            >
              ×
            </button>
          )}
        </div>
        
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="category">Category:</label>
            <select 
              id="category" 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="necklace">Necklaces</option>
              <option value="bracelet">Bracelets</option>
              <option value="earring">Earrings</option>
              <option value="ring">Rings</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="price-min">Price Range:</label>
            <div className="price-inputs">
              <input
                type="number"
                id="price-min"
                min="0"
                max={priceRange[1]}
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              />
              <span>to</span>
              <input
                type="number"
                id="price-max"
                min={priceRange[0]}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Products Display */}
      <div className="products-container">
        {loading ? (
          <div className="flex justify-center items-center w-full py-20">
            <div className="animate-spin text-gray-500 mr-2">
              <FiLoader size={30} />
            </div>
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 rounded-lg shadow-md w-full">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={fetchProducts}
              className="mt-4 bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div key={product._id} className="product-card">
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
              <div className="product-info">
                <h3>{product.name}</h3>
                <div className="product-rating">
                  <FiStar className="star-icon filled" />
                  <span>{product.rating ? product.rating.toFixed(1) : 'N/A'}</span>
                </div>
                <p className="product-price">₹{product.price.toFixed(2)}</p>
                <button 
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.isAvailable || product.stock <= 0}
                >
                  <FiShoppingCart />
                  {product.isAvailable && product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-products">
            <p>No products found. Try adjusting your filters or <button 
              onClick={fetchProducts}
              className="text-purple-600 underline"
            >refresh the page</button>.</p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Shop;

