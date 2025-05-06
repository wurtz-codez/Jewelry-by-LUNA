import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiSearch, FiShoppingCart, FiStar, FiLoader, FiRefreshCw, FiHeart, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import bannerImage from '../assets/Shop-page-banner.png';
import axios from 'axios';
import { useShop } from '../contexts/ShopContext';
import ProductCard from '../assets/cards/ProductCard';

const API_BASE_URL = 'http://localhost:5001/api';

const Shop = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [priceRange, setPriceRange] = useState([0, Infinity]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart, addToWishlist, wishlist } = useShop();
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Pagination and sorting state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  
  // Clear filters on mount
  useEffect(() => {
    clearFilters();
  }, []);
  
  // Parse URL search parameters
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchParam = queryParams.get('search');
    const productParam = queryParams.get('product');
    const pageParam = queryParams.get('page');
    const categoryParam = queryParams.get('category');
    const tagParam = queryParams.get('tag');
    
    if (searchParam) setSearchTerm(searchParam);
    if (productParam) setSelectedProduct(productParam);
    if (pageParam) setCurrentPage(Number(pageParam));
    if (categoryParam) setSelectedCategory(categoryParam);
    if (tagParam) setSelectedTag(tagParam);
  }, [location]);
  
  // Fetch products with filters
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 20,
        sort: sortBy,
        order: sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedTag !== 'all' && { tag: selectedTag }),
        ...(priceRange[0] > 0 && { minPrice: priceRange[0] }),
        ...(priceRange[1] < Infinity && { maxPrice: priceRange[1] })
      });

      const response = await axios.get(`${API_BASE_URL}/jewelry?${queryParams}`);
      
      if (response.data) {
        setProducts(response.data.products);
        setTotalPages(response.data.pagination.pages);
        setCategories(response.data.filters.categories);
        setTags(response.data.filters.tags);
        setError('');
      }
    } catch (err) {
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Update URL with current filters
  const updateURL = () => {
    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.set('search', searchTerm);
    if (currentPage > 1) queryParams.set('page', currentPage);
    if (selectedCategory !== 'all') queryParams.set('category', selectedCategory);
    if (selectedTag !== 'all') queryParams.set('tag', selectedTag);
    if (selectedProduct) queryParams.set('product', selectedProduct);
    
    navigate(`/shop?${queryParams.toString()}`);
  };

  // Effect to fetch products when filters change
  useEffect(() => {
    fetchProducts();
    updateURL();
  }, [currentPage, searchTerm, selectedCategory, selectedTag, priceRange, sortBy, sortOrder]);

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
  
  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedTag('all');
    setPriceRange([0, Infinity]);
    setSelectedProduct(null);
    setCurrentPage(1);
    setSortBy('createdAt');
    setSortOrder('desc');
    navigate('/shop');
  };

  return (
    <div className="shop-page bg-white">
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
              {categories.map(category => (
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
              {tags.map(tag => (
                <option key={tag} value={tag}>
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="sort">Sort By:</label>
            <select
              id="sort"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="sellingPrice-asc">Price: Low to High</option>
              <option value="sellingPrice-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
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
          
          {(searchTerm || selectedCategory !== 'all' || selectedTag !== 'all' || priceRange[0] > 0 || priceRange[1] < Infinity) && (
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
      <div className="products-container grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-10 px-4 sm:px-6 lg:px-32 py-8 auto-rows-fr">
        {loading ? (
          <div className="col-span-full flex justify-center items-center w-full py-20">
            <div className="animate-spin text-gray-500 mr-2">
              <FiLoader size={30} />
            </div>
            <span>Loading products...</span>
          </div>
        ) : error ? (
          <div className="col-span-full text-center text-red-500 py-20">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-20">
            No products found matching your criteria
          </div>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={() => handleAddToCart(product)}
              onAddToWishlist={() => handleAddToWishlist(product)}
              onClick={() => handleProductClick(product._id)}
              isInWishlist={wishlist.some(item => item._id === product._id)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && products.length > 0 && (
        <div className="pagination flex justify-center items-center gap-4 py-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            <FiChevronLeft />
          </button>
          
          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            <FiChevronRight />
          </button>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default Shop;

