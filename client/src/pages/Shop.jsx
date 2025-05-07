import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiSearch, FiShoppingCart, FiStar, FiLoader, FiRefreshCw, FiHeart, FiChevronLeft, FiChevronRight, FiFilter } from 'react-icons/fi';
import axios from 'axios';
import { useShop } from '../contexts/ShopContext';
import ProductCard from '../assets/cards/ProductCard';
import useDebounce from '../hooks/useDebounce';
import Toast from '../components/Toast';

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
  const [showFilters, setShowFilters] = useState(false);
  
  // Add debounced values
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms delay
  const debouncedPriceRange = useDebounce(priceRange, 500); // 500ms delay
  
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
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedTag !== 'all' && { tag: selectedTag }),
        ...(debouncedPriceRange[0] > 0 && { minPrice: debouncedPriceRange[0] }),
        ...(debouncedPriceRange[1] < Infinity && { maxPrice: debouncedPriceRange[1] })
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
    if (debouncedSearchTerm) queryParams.set('search', debouncedSearchTerm);
    if (currentPage > 1) queryParams.set('page', currentPage);
    if (selectedCategory !== 'all') queryParams.set('category', selectedCategory);
    if (selectedTag !== 'all') queryParams.set('tag', selectedTag);
    if (selectedProduct) queryParams.set('product', selectedProduct);
    
    navigate(`/shop?${queryParams.toString()}`);
  };

  // Update the useEffect to use debounced values
  useEffect(() => {
    fetchProducts();
    updateURL();
  }, [currentPage, debouncedSearchTerm, selectedCategory, selectedTag, debouncedPriceRange, sortBy, sortOrder]);

  // Handle adding to cart
  const handleAddToCart = async (product) => {
    try {
      const success = await addToCart(product);
      if (success) {
        setToastMessage(`${product.name} added to cart successfully!`);
        setToastType('success');
        setShowToast(true);
        // Auto-hide toast after 3 seconds
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error in handleAddToCart:', error);
      setToastMessage('An error occurred. Please try again.');
      setToastType('error');
      setShowToast(true);
      // Auto-hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
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

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  return (
    <div className="shop-page bg-white">
      <Navbar variant="white" />
      
      {/* Shop Heading */}
      <div className="text-center mt-16 sm:mt-24 md:mt-32 mb-8 sm:mb-12 md:mb-16 px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-cinzel-decorative text-secondary">Explore our collection</h1>
      </div>
      
      {/* Search and Filters */}
      <div className="sticky top-16 md:top-20 z-40 bg-white shadow-sm">
        <div className="shop-controls px-4 sm:px-6 lg:px-8 xl:px-32 py-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
            {/* Filters Button and Dropdown */}
            <div className="w-full sm:w-1/4 lg:w-1/5 relative">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="w-full h-12 sm:h-16 flex text-lg sm:text-xl items-center justify-center gap-2 py-2 sm:py-3 px-4 bg-neutral  rounded-full transition-colors"
              >
                <FiFilter />
                <span>Filters</span>
              </button>
              
              {showFilters && (
                <div className="fixed sm:absolute inset-0 sm:inset-auto top-16 sm:top-20 left-0 w-full sm:w-[300px] lg:w-[350px] mt-0 sm:mt-2 bg-neutral rounded-none sm:rounded-3xl shadow-lg p-4 sm:p-6 z-[100] flex flex-col h-[calc(100vh-4rem)] sm:h-auto sm:max-h-[calc(80vh-2rem)]">
                  <div className="flex justify-between items-center mb-4 sm:hidden">
                    <h2 className="text-xl font-medium text-neutral-800">Filters</h2>
                    <button 
                      onClick={() => setShowFilters(false)}
                      className="p-2 hover:bg-neutral-100 rounded-full text-xl text-neutral-700"
                    >
                      ×
                    </button>
                  </div>
                  <div className="filters space-y-6 overflow-y-auto flex-1">
                    {/* Categories Section */}
                    <div className="filter-group">
                      <label htmlFor="category" className="block text-base sm:text-lg font-medium text-neutral-800 mb-2 sm:mb-3">Categories</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setSelectedCategory('all')}
                          className={`p-2 sm:p-3 rounded-full text-sm sm:text-base font-medium transition-all ${
                            selectedCategory === 'all' 
                              ? 'bg-primary text-white' 
                              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                          }`}
                        >
                          All Categories
                        </button>
                        {categories.map(category => (
                          <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`p-2 sm:p-3 rounded-full text-sm sm:text-base font-medium transition-all ${
                              selectedCategory === category 
                                ? 'bg-primary text-white' 
                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                            }`}
                          >
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tags Section */}
                    <div className="filter-group">
                      <label htmlFor="tag" className="block text-base sm:text-lg font-medium text-neutral-800 mb-2 sm:mb-3">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedTag('all')}
                          className={`px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base font-medium transition-all ${
                            selectedTag === 'all' 
                              ? 'bg-primary text-white' 
                              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                          }`}
                        >
                          All Tags
                        </button>
                        {tags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className={`px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base font-medium transition-all ${
                              selectedTag === tag 
                                ? 'bg-primary text-white' 
                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                            }`}
                          >
                            {tag.charAt(0).toUpperCase() + tag.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price Range Section */}
                    <div className="filter-group">
                      <label className="block text-base sm:text-lg font-medium text-neutral-800 mb-2 sm:mb-3">Price Range</label>
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                          <div className="flex-1">
                            <label htmlFor="price-min" className="block text-sm sm:text-base text-neutral-600 mb-1">Min Price</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-base sm:text-lg">₹</span>
                              <input
                                type="number"
                                id="price-min"
                                min="0"
                                max={priceRange[1]}
                                value={priceRange[0]}
                                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                className="w-full p-2 sm:p-3 pl-10 sm:pl-12 bg-white border border-neutral-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                                placeholder="0"
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <label htmlFor="price-max" className="block text-sm sm:text-base text-neutral-600 mb-1">Max Price</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-base sm:text-lg">₹</span>
                              <input
                                type="number"
                                id="price-max"
                                min={priceRange[0]}
                                max="100000"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                className="w-full p-2 sm:p-3 pl-10 sm:pl-12 bg-white border border-neutral-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                                placeholder="100000"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm sm:text-base text-neutral-500">
                          <span>₹{priceRange[0]}</span>
                          <span>₹{priceRange[1]}</span>
                        </div>
                      </div>
                    </div>

                    {/* Sort Section */}
                    <div className="filter-group">
                      <label htmlFor="sort" className="block text-base sm:text-lg font-medium text-neutral-800 mb-2 sm:mb-3">Sort By</label>
                      <select
                        id="sort"
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                          const [newSortBy, newSortOrder] = e.target.value.split('-');
                          setSortBy(newSortBy);
                          setSortOrder(newSortOrder);
                        }}
                        className="w-full p-2 sm:p-3 bg-white border border-neutral-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base text-neutral-700"
                      >
                        <option value="createdAt-desc">Newest First</option>
                        <option value="createdAt-asc">Oldest First</option>
                        <option value="sellingPrice-asc">Price: Low to High</option>
                        <option value="sellingPrice-desc">Price: High to Low</option>
                        <option value="name-asc">Name: A to Z</option>
                        <option value="name-desc">Name: Z to A</option>
                      </select>
                    </div>

                    {/* Clear Filters Button */}
                    {(debouncedSearchTerm || selectedCategory !== 'all' || selectedTag !== 'all' || priceRange[0] > 0 || priceRange[1] < Infinity) && (
                      <button 
                        onClick={clearFilters}
                        className="w-full py-2 sm:py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full transition-colors font-medium text-sm sm:text-base"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Search Section */}
            <div className="w-full sm:w-3/4 lg:w-4/5">
              <div className="search-container relative">
                <FiSearch className="search-icon absolute left-4 sm:left-8 top-1/2 transform -translate-y-1/2 text-neutral-400 text-lg sm:text-xl" />
                <input
                  type="text"
                  placeholder="Search for jewelry..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-12 sm:h-16 p-2 sm:p-3 pl-12 sm:pl-16 bg-neutral border border-neutral-200 rounded-full focus:outline-none focus:ring-2 focus:ring-neutral-200 text-neutral-900 placeholder-neutral-400 text-base sm:text-lg placeholder:text-base sm:placeholder:text-xl"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 sm:right-8 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 text-lg sm:text-xl"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Products Display */}
      <div className="products-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 xl:gap-10 px-4 sm:px-6 lg:px-8 xl:px-32 py-8 auto-rows-fr">
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
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default Shop;

