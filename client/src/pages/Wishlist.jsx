import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiTrash2, FiShoppingCart, FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
import { useShop } from '../contexts/ShopContext';
import placeholderImage from '../assets/placeholder.png';
import Toast from '../components/Toast';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = 'https://jewelry-by-luna.onrender.com/api';

// Animation variants
const pageAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } }
};

const wishlistItemAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

const buttonHoverAnimation = { scale: 1.05 };
const buttonTapAnimation = { scale: 0.95 };

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useShop();
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isDeletingItem, setIsDeletingItem] = useState({});
  const [isAddingToCart, setIsAddingToCart] = useState({});

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/wishlist`, {
        headers: { 'x-auth-token': token }
      });

      setWishlist(response.data.items || []);
      setError('');
    } catch (err) {
      setError('Failed to load wishlist. Please try again later.');
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      setIsDeletingItem(prev => ({ ...prev, [productId]: true }));
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      await axios.delete(`${API_BASE_URL}/wishlist/items/${productId}`, {
        headers: { 'x-auth-token': token }
      });

      // Update local wishlist state
      setWishlist(prev => prev.filter(item => item._id !== productId));
      setToastMessage('Item removed from wishlist');
      setToastType('success');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setError('Failed to remove item from wishlist. Please try again later.');
      console.error('Error removing from wishlist:', err);
      setToastMessage('Failed to remove item from wishlist');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsDeletingItem(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleAddToCart = async (product) => {
    try {
      setIsAddingToCart(prev => ({ ...prev, [product._id]: true }));
      const success = await addToCart(product);
      if (success) {
        setToastMessage('Item added to cart successfully!');
        setToastType('success');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      setToastMessage('Failed to add item to cart');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsAddingToCart(prev => ({ ...prev, [product._id]: false }));
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Helper function to get the best image URL for a product
  const getImageUrl = (product) => {
    // Check for imageUrls array first
    if (product?.imageUrls && product.imageUrls.length > 0) {
      const mainImage = product.imageUrls[0];
      if (mainImage.startsWith('http')) {
        return mainImage;
      }
      if (mainImage.startsWith('/uploads')) {
        return `${API_BASE_URL}${mainImage}`;
      }
    }
    
    // Fallback to single imageUrl
    if (product?.imageUrl) {
      if (product.imageUrl.startsWith('http')) {
        return product.imageUrl;
      }
      if (product.imageUrl.startsWith('/uploads')) {
        return `${API_BASE_URL}${product.imageUrl}`;
      }
    }
    
    return placeholderImage;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar variant="white" />
        <div className="container mx-auto px-4 py-16 sm:py-20">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar variant="white" />
        <div className="container mx-auto px-4 py-16 sm:py-20">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center max-w-3xl mx-auto">
            <p className="text-red-600">{error}</p>
            <motion.button
              onClick={fetchWishlist}
              className="mt-4 bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
              whileHover={buttonHoverAnimation}
              whileTap={buttonTapAnimation}
            >
              Try Again
            </motion.button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <motion.div 
      className="wishlist-page min-h-screen flex flex-col bg-white"
      initial="initial"
      animate="animate"
      variants={pageAnimation}
    >
      <Navbar variant="white" />
      <div className="flex justify-center w-full">
        <div className="page-container pt-16 pb-8 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 max-w-[92rem] w-full flex-grow mt-2 mx-auto">
          <motion.h1 
            className="text-xl sm:text-2xl md:text-3xl font-cinzel-decorative text-secondary text-center mb-4 sm:mb-6 md:mb-8 mx-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            My Wishlist
          </motion.h1>
          
          {wishlist.length === 0 ? (
            <motion.div 
              className="text-center py-8 sm:py-16 md:py-24 bg-white rounded-[16px] shadow-lg max-w-4xl mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <FiShoppingCart className="mx-auto text-gray-400 mb-4 sm:mb-6 md:mb-8 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
              <h2 className="text-xl sm:text-3xl md:text-4xl font-cinzel-decorative text-secondary mb-2 sm:mb-4 md:mb-6">Your wishlist is empty</h2>
              <p className="text-gray-500 mb-6 sm:mb-8 md:mb-10 text-base sm:text-lg md:text-xl px-4">Looks like you haven't added any jewelry to your wishlist yet.</p>
              <motion.button 
                onClick={() => navigate('/shop')}
                className="bg-primary text-white py-2 sm:py-3 md:py-4 px-4 sm:px-6 md:px-8 rounded-[12px] hover:bg-primary/90 transition-colors inline-flex items-center gap-1 sm:gap-2 md:gap-3 text-sm sm:text-base md:text-lg lg:text-xl font-medium"
                whileHover={buttonHoverAnimation}
                whileTap={buttonTapAnimation}
              >
                <FiArrowLeft size={16} className="sm:w-5 sm:h-5 md:w-7 md:h-7" />
                Browse Jewelry
              </motion.button>
            </motion.div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6">
              <AnimatePresence>
                <div className="space-y-2 sm:space-y-3">
                  {wishlist.map(item => (
                    <motion.div 
                      key={item._id}
                      variants={wishlistItemAnimation}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="flex flex-row items-center gap-2 sm:gap-4 p-2 sm:p-3 md:p-4 rounded-lg bg-white shadow-md transition-colors"
                    >
                      <motion.div 
                        className="w-16 sm:w-24 md:w-32 h-16 sm:h-24 md:h-32 rounded-lg overflow-hidden flex-shrink-0"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <img 
                          src={getImageUrl(item)}
                          alt={item.name || 'Jewelry'} 
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => handleProductClick(item._id)}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = placeholderImage;
                          }}
                        />
                      </motion.div>
                      
                      <div className="flex-grow">
                        <motion.h3 
                          className="text-sm sm:text-base md:text-lg lg:text-xl font-playfair-display font-medium text-gray-900 cursor-pointer hover:text-primary transition-colors line-clamp-1 sm:line-clamp-none"
                          onClick={() => handleProductClick(item._id)}
                          whileHover={buttonHoverAnimation}
                          whileTap={buttonTapAnimation}
                        >
                          {item.name || 'Unknown Product'}
                          {(item.discount > 0 || (item.price > item.sellingPrice)) && (
                            <motion.span 
                              className="ml-1 sm:ml-2 px-1 sm:px-2 py-0.5 text-xs sm:text-sm bg-green-100 text-green-700 rounded-md font-cinzel inline-block align-middle"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              {Math.round(((item.price - item.sellingPrice) / item.price) * 100)}% OFF
                            </motion.span>
                          )}
                        </motion.h3>
                        
                        {/* Product Description - Hide on small screens */}
                        {item.description && (
                          <p className="text-gray-600 text-xs sm:text-sm mt-0.5 sm:mt-1 mb-1 sm:mb-2 line-clamp-1 sm:line-clamp-2 hidden sm:block">
                            {item.description}
                          </p>
                        )}
                        
                        {/* Categories and Tags - Show fewer on mobile */}
                        <div className="flex flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-2">
                          {item.categories?.slice(0, 1).map((category, index) => (
                            <motion.span 
                              key={index}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.1 }}
                              className="px-1 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs bg-neutral/10 text-gray-700 rounded-md font-cinzel hover:bg-neutral/20 transition-colors border"
                            >
                              {category}
                            </motion.span>
                          ))}
                          {item.categories?.length > 1 && (
                            <span className="px-1 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs text-gray-500">
                              +{item.categories.length - 1}
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-2 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-3">
                          {/* Price Information */}
                          <motion.div 
                            className="text-left w-full sm:w-auto"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <div className="text-gray-600 text-xs sm:text-sm">
                              {item.discount > 0 || (item.price > item.sellingPrice) ? (
                                <>
                                  <span className="line-through text-gray-400">₹{item.price?.toLocaleString('en-IN')}</span>
                                  <span className="mx-1 sm:mx-2">→</span>
                                  <span className="text-green-600">₹{item.sellingPrice?.toLocaleString('en-IN')}</span>
                                </>
                              ) : (
                                <span>₹{item.sellingPrice?.toLocaleString('en-IN') || item.price?.toLocaleString('en-IN')}</span>
                              )}
                            </div>
                          </motion.div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-1 sm:gap-2 md:gap-4 mt-1 sm:mt-0 w-full sm:w-auto justify-end">
                            <motion.button
                              onClick={() => handleAddToCart(item)}
                              className="px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-md bg-primary text-white flex items-center gap-1 sm:gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              whileHover={buttonHoverAnimation}
                              whileTap={buttonTapAnimation}
                              disabled={isAddingToCart[item._id]}
                            >
                              {isAddingToCart[item._id] ? (
                                <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <FiShoppingCart size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                              )}
                              <span className="text-xs sm:text-sm md:text-base">Add to Cart</span>
                            </motion.button>
                            
                            <motion.button
                              onClick={() => handleRemoveFromWishlist(item._id)}
                              className="p-1.5 sm:p-2 rounded-md border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              disabled={isDeletingItem[item._id]}
                            >
                              {isDeletingItem[item._id] ? (
                                <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <>
                                  <FiTrash2 size={16} className="sm:w-4 sm:h-4 md:w-5 md:h-5" />
                                  <span className="text-xs sm:text-sm hidden md:inline">Remove</span>
                                </>
                              )}
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
              
              <motion.div 
                className="mt-4 sm:mt-6 md:mt-8 flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.button 
                  onClick={() => navigate('/shop')}
                  className="bg-neutral text-gray-700 py-2 sm:py-3 px-4 sm:px-6 md:px-8 rounded-[12px] hover:bg-neutral/80 transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base font-medium"
                  whileHover={buttonHoverAnimation}
                  whileTap={buttonTapAnimation}
                >
                  <FiArrowLeft size={16} className="sm:w-5 sm:h-5" />
                  Continue Shopping
                </motion.button>
              </motion.div>
            </div>
          )}
        </div>
      </div>
      <Footer />
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </motion.div>
  );
};

export default Wishlist;