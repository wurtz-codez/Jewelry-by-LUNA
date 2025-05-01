import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiSearch, FiShoppingCart, FiStar, FiLoader, FiRefreshCw, FiHeart } from 'react-icons/fi';
import bannerImage from '../assets/Shop-page-banner.png';
import axios from 'axios';
import { useShop } from '../contexts/ShopContext';
import { useLocation } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5001/api';

const Shop = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 30000]); // Set higher default maximum
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart, addToWishlist, wishlist } = useShop();
  const location = useLocation();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedTag, setSelectedTag] = useState('all');
  
  // Parse URL search parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchParam = queryParams.get('search');
    const productParam = queryParams.get('product');
    
    if (searchParam) {
      setSearchTerm(searchParam);
    }
    
    if (productParam) {
      setSelectedProduct(productParam);
    }
  }, [location]);
  
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
        
        // If there's a selected product, scroll to it
        if (selectedProduct) {
          const productDetails = response.data.find(p => p._id === selectedProduct);
          if (productDetails) {
            // You could implement a modal or scroll behavior here
            // For now, we'll filter to just show this product
            setFilteredProducts([productDetails]);
          }
        }
        
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
    let filtered = products;
    
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.categories.includes(selectedCategory));
    }

    if (selectedTag !== 'all') {
      filtered = filtered.filter(product => product.tags.includes(selectedTag));
    }
    
    if (priceRange[0] > 0 || priceRange[1] < Infinity) {
      filtered = filtered.filter(product => 
        product.price >= priceRange[0] && product.price <= priceRange[1]
      );
    }
    
    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, selectedTag, priceRange]);
  
  // Get all unique categories and tags from products
  const allCategories = [...new Set(products.flatMap(product => product.categories))];
  const allTags = [...new Set(products.flatMap(product => product.tags))];
  
  // Handle adding to cart
  const handleAddToCart = (product) => {
    addToCart(product);
  };

  // Handle adding to wishlist
  const handleAddToWishlist = (product) => {
    addToWishlist(product);
  };

  // Handle product click
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
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
  
  // Clear filters and selected product
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedTag('all');
    setPriceRange([0, Infinity]);
    setSelectedProduct(null);
    // Update URL to remove query parameters
    window.history.pushState({}, '', '/shop');
  };
  
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
              {allCategories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="tag">Tag:</label>
            <select 
              id="tag" 
              value={selectedTag} 
              onChange={(e) => setSelectedTag(e.target.value)}
            >
              <option value="all">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </option>
              ))}
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
          
          {(searchTerm || selectedCategory !== 'all' || selectedProduct) && (
            <button 
              onClick={clearFilters}
              className="clear-filters-btn"
            >
              Clear Filters
            </button>
          )}
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
            <div 
              key={product._id} 
              className="product-card"
              onClick={() => handleProductClick(product._id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="product-image">
                <img 
                  src={
                    product.imageUrl.startsWith('http') 
                      ? product.imageUrl 
                      : product.imageUrl.startsWith('/uploads') 
                      ? `${API_BASE_URL}${product.imageUrl}`
                      : '/placeholder.svg'
                  }
                  alt={product.name}
                />
                {product.tags && product.tags.map((tag, index) => (
                  <div key={index} className={`product-tag ${tag.replace(/\s+/g, '-')}`}>
                    {tag}
                  </div>
                ))}
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">₹{product.price.toFixed(2)}</p>
                <div className="product-rating">
                  <FiStar className="star-icon" />
                  <span>{product.rating || '4.5'}</span>
                </div>
                <div className="product-actions">
                  <button 
                    className="wishlist-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToWishlist(product);
                    }}
                  >
                    <FiHeart 
                      className={wishlist.some(item => item._id === product._id) ? 'active' : ''} 
                    />
                  </button>
                  <button 
                    className="add-to-cart-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                  >
                    <FiShoppingCart />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p>No products found matching your criteria.</p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Shop;

