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

const API_BASE_URL = 'https://jewelry-by-luna.onrender.com/api';

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
      <div className="text-center mt-[68px] sm:mt-[72px] md:mt-[76px] mb-4 sm:mb-6 px-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-cinzel-decorative text-secondary">Explore our collection</h1>
      </div>
      
      {/* Search and Filters */}
      <div className="sticky top-12 sm:top-14 md:top-16 z-30 bg-white shadow-sm">
        <div className="shop-controls px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          {/* Controls Container */}
          <div className="flex flex-col gap-2">
            {/* Search Bar Row */}
            <div className="flex min-[650px]:items-center gap-2">
              {/* Filters Button - Left on 650px+, otherwise in bottom row */}
              <div className="hidden min-[650px]:block min-[650px]:w-1/4">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full h-8 sm:h-10 flex text-sm sm:text-base items-center justify-center gap-2 py-1.5 px-3 bg-neutral rounded-md transition-colors"
                >
                  <FiFilter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Filters</span>
                </button>
                
                {showFilters && (
                  <div className="absolute top-full left-0 mt-2 w-[280px] bg-white rounded-lg shadow-lg p-4 z-[100]">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-base font-medium text-neutral-800">Filters</h2>
                      <button 
                        onClick={() => setShowFilters(false)}
                        className="p-1.5 hover:bg-neutral-100 rounded-full text-lg text-neutral-700"
                      >
                        ×
                      </button>
                    </div>
                    <div className="filters space-y-4 max-h-[70vh] overflow-y-auto">
                      {/* Categories Section */}
                      <div className="filter-group">
                        <label htmlFor="category" className="block text-sm font-medium text-neutral-800 mb-2">Categories</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => setSelectedCategory('all')}
                            className={`p-1.5 sm:p-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
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
                              className={`p-1.5 sm:p-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
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
                        <label htmlFor="tag" className="block text-sm font-medium text-neutral-800 mb-2">Tags</label>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => setSelectedTag('all')}
                            className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
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
                              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
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
                        <label className="block text-sm font-medium text-neutral-800 mb-2">Price Range</label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={priceRange[0] === 0 ? '' : priceRange[0]}
                              onChange={(e) => setPriceRange([e.target.value === '' ? 0 : Number(e.target.value), priceRange[1]])}
                              className="w-full p-1.5 sm:p-2 rounded-md border border-neutral-200 text-sm bg-white"
                              placeholder="Min Price"
                            />
                            <span className="text-sm text-neutral-600">to</span>
                            <input
                              type="number"
                              value={priceRange[1] === Infinity ? '' : priceRange[1]}
                              onChange={(e) => setPriceRange([priceRange[0], e.target.value === '' ? Infinity : Number(e.target.value)])}
                              className="w-full p-1.5 sm:p-2 rounded-md border border-neutral-200 text-sm bg-white"
                              placeholder="Max Price"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Clear Filters Button */}
                      <button
                        onClick={clearFilters}
                        className="w-full py-1.5 sm:py-2 px-3 bg-neutral-200 text-neutral-700 rounded-md text-sm font-medium hover:bg-neutral-300 transition-colors"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Search Bar - Full width on small screens, 50% on 650px+ */}
              <div className="w-full min-[650px]:w-1/2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for jewelry..."
                    className="w-full h-8 sm:h-10 pl-8 sm:pl-10 pr-3 text-sm bg-white border-0 border-b border-neutral-200 focus:outline-none focus:ring-0"
                  />
                  <FiSearch className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400" />
                </div>
              </div>

              {/* Sort Dropdown - Right on 650px+, otherwise in bottom row */}
              <div className="hidden min-[650px]:block min-[650px]:w-1/4">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder);
                  }}
                  className="w-full h-8 sm:h-10 pl-2 sm:pl-3 pr-8 rounded-md border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 bg-[rgb(232,229,224)] cursor-pointer"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>
            </div>

            {/* Bottom Row for Filter and Sort on Small Screens */}
            <div className="flex min-[650px]:hidden gap-2">
              {/* Filters Button */}
              <div className="w-1/2">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full h-8 sm:h-10 flex text-sm sm:text-base items-center justify-center gap-2 py-1.5 px-3 bg-neutral rounded-md transition-colors"
                >
                  <FiFilter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Filters</span>
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="w-1/2">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    setSortBy(newSortBy);
                    setSortOrder(newSortOrder);
                  }}
                  className="w-full h-8 sm:h-10 px-2 sm:px-3 rounded-md border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20 bg-[rgb(232,229,224)]"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <FiLoader className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-6 sm:py-8">
            <p className="text-red-500 text-sm">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-3 px-3 py-1.5 bg-primary text-white rounded-md text-sm hover:bg-primary/90 transition-colors"
            >
              <FiRefreshCw className="inline-block mr-2" />
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <p className="text-neutral-600 text-sm">No products found matching your criteria.</p>
            <button
              onClick={clearFilters}
              className="mt-3 px-3 py-1.5 bg-primary text-white rounded-md text-sm hover:bg-primary/90 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onClick={() => handleProductClick(product._id)}
                  isInWishlist={wishlist.some(item => item._id === product._id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6 sm:mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 sm:p-2 rounded-md border border-neutral-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100 transition-colors"
            >
              <FiChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 sm:p-2 rounded-md border border-neutral-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100 transition-colors"
            >
              <FiChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        )}
      </div>

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

