import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiSearch, FiShoppingCart, FiStar, FiLoader, FiRefreshCw, FiHeart, FiChevronLeft, FiChevronRight, FiFilter } from 'react-icons/fi';
import { useShop } from '../contexts/ShopContext';
import ProductCard from '../assets/cards/ProductCard';
import useDebounce from '../hooks/useDebounce';
import Toast from '../components/Toast';
import { useJewelryQuery } from '../hooks/useJewelryQuery';
import LoadingScreen from '../components/LoadingScreen';

const API_BASE_URL = 'https://jewelry-by-luna.onrender.com/api';

const Shop = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('category') || 'all';
  });
  const [selectedTag, setSelectedTag] = useState('all');
  const [priceRange, setPriceRange] = useState([0, Infinity]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const { addToCart, addToWishlist, wishlist } = useShop();
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Add debounced values
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms delay
  const debouncedPriceRange = useDebounce(priceRange, 500); // 500ms delay
  
  // Parse URL search parameters only on initial load
  useEffect(() => {
    if (!initialLoad) return;
    
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
    
    setInitialLoad(false);
  }, [location, initialLoad]);

  // Create query params object for React Query
  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: 20,
    sort: sortBy,
    order: sortOrder,
    search: debouncedSearchTerm,
    category: selectedCategory,
    tag: selectedTag,
    minPrice: debouncedPriceRange[0] > 0 ? debouncedPriceRange[0] : undefined,
    maxPrice: debouncedPriceRange[1] < Infinity ? debouncedPriceRange[1] : undefined
  }), [currentPage, sortBy, sortOrder, debouncedSearchTerm, selectedCategory, selectedTag, debouncedPriceRange]);

  // Use React Query to fetch products
  const { data, isLoading, isError, error } = useJewelryQuery(queryParams);
  
  // Extract data from query results
  const products = data?.products || [];
  const totalPages = data?.pagination?.pages || 1;
  const categories = data?.filters?.categories || [];
  const tags = data?.filters?.tags || [];

  // Update URL with current filters - only if not initial load
  useEffect(() => {
    if (initialLoad) return;
    
    const queryParams = new URLSearchParams();
    if (debouncedSearchTerm) queryParams.set('search', debouncedSearchTerm);
    if (currentPage > 1) queryParams.set('page', currentPage);
    if (selectedCategory !== 'all') queryParams.set('category', selectedCategory);
    if (selectedTag !== 'all') queryParams.set('tag', selectedTag);
    if (selectedProduct) queryParams.set('product', selectedProduct);
    
    navigate(`/shop?${queryParams.toString()}`);
  }, [currentPage, debouncedSearchTerm, selectedCategory, selectedTag, debouncedPriceRange, sortBy, sortOrder, initialLoad, navigate, selectedProduct]);

  // Handle adding to cart
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

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

      {/* Product Grid */}
      <div className="product-grid px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {isLoading ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="animate-spin text-primary">
              <FiLoader className="w-6 h-6" />
            </div>
          </div>
        ) : isError ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <p className="text-red-500">Error loading products. Please try again.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center">
            <p className="text-gray-500 mb-4">No products found matching your criteria.</p>
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 py-2 px-4 bg-primary text-white rounded-md"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Clear filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={() => handleAddToCart(product)}
                onAddToWishlist={() => handleAddToWishlist(product)}
                onClick={() => handleProductClick(product._id)}
                isInWishlist={wishlist.some(item => item._id === product._id)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {!isLoading && products.length > 0 && (
        <div className="pagination flex justify-center items-center gap-2 py-4 sm:py-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-full ${
              currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1 sm:gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${
                    currentPage === pageNum
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-full ${
              currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FiChevronRight className="w-5 h-5" />
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

