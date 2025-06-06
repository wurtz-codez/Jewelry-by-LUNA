import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import placeholderImage from '../assets/placeholder.png';
import { useShop } from '../contexts/ShopContext';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ReviewSection from '../components/ReviewSection';
import { debounce } from 'lodash';
import Toast from '../components/Toast';
import { FiLock } from 'react-icons/fi';

const API_BASE_URL = 'https://jewelry-by-luna.onrender.com/api';

function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedTab, setSelectedTab] = useState('Most Helpful');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, cart, updateCartItemQuantity } = useShop();
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [ratingDistribution, setRatingDistribution] = useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0
  });
  
  // Check if product is in wishlist
  const isInWishlist = product && wishlist.some(item => item._id === product._id);

  // Get cart quantity for this product
  const cartQuantity = product ? cart?.items?.find(item => item?.jewelry?._id === product._id)?.quantity || 0 : 0;

  // Update quantity when product is loaded or cart changes
  useEffect(() => {
    if (product) {
      const cartItem = cart?.items?.find(item => item?.jewelry?._id === product._id);
      if (cartItem) {
        setQuantity(cartItem.quantity);
      } else {
        setQuantity(1);
      }
    }
  }, [product, cart]);
  
  // Get the product's images and videos
  const getProductImages = () => {
    const media = [];
    
    // Add images
    if (product?.imageUrls && product.imageUrls.length > 0) {
      product.imageUrls.forEach(url => {
        media.push({
          type: 'image',
          url: url.startsWith('http') ? url : url.startsWith('/uploads') ? `${API_BASE_URL}${url}` : placeholderImage
        });
      });
    }
    
    // Add videos
    if (product?.videoUrls && product.videoUrls.length > 0) {
      product.videoUrls.forEach(url => {
        media.push({
          type: 'video',
          url: url.startsWith('http') ? url : url.startsWith('/uploads') ? `${API_BASE_URL}${url}` : null
        });
      });
    }
    
    return media.length > 0 ? media : [{ type: 'image', url: placeholderImage }];
  };

  const productMedia = getProductImages();
  
  // Function to fetch related products
  const fetchRelatedProducts = async (product) => {
    try {
      if (!product) {
        setRelatedProducts([]);
        return;
      }

      // Fetch all products with a cache-busting parameter
      const response = await axios.get(`${API_BASE_URL}/jewelry?t=${Date.now()}`);
      if (!response.data || !response.data.products || !Array.isArray(response.data.products)) {
        console.error('Invalid API response structure:', response.data);
        setRelatedProducts([]);
        return;
      }

      let filteredProducts = response.data.products.filter(p => 
        p._id !== product._id && 
        p.isAvailable && 
        p.stock > 0
      );

      // Shuffle the filtered products to get different results each time
      filteredProducts = filteredProducts.sort(() => Math.random() - 0.5);
      let relatedProducts = [];

      // First try to find products with matching categories
      if (product.categories?.length > 0) {
        const categoryMatches = filteredProducts.filter(p => 
          p.categories?.some(category => product.categories.includes(category))
        );
        
        if (categoryMatches.length > 0) {
          // Sort by number of matching categories (most matches first)
          categoryMatches.sort((a, b) => {
            const aMatches = a.categories.filter(c => product.categories.includes(c)).length;
            const bMatches = b.categories.filter(c => product.categories.includes(c)).length;
            return bMatches - aMatches;
          });
          // Take up to 2 products from category matches
          relatedProducts = categoryMatches.slice(0, 2);
        }
      }

      // Then try to find products with matching tags
      if (product.tags?.length > 0) {
        const tagMatches = filteredProducts.filter(p => 
          p._id !== product._id &&
          !relatedProducts.some(rp => rp._id === p._id) &&
          p.tags?.some(tag => product.tags.includes(tag))
        );
        
        if (tagMatches.length > 0) {
          // Sort by number of matching tags (most matches first)
          tagMatches.sort((a, b) => {
            const aMatches = a.tags.filter(t => product.tags.includes(t)).length;
            const bMatches = b.tags.filter(t => product.tags.includes(t)).length;
            return bMatches - aMatches;
          });
          // Take up to 1 product from tag matches
          relatedProducts = [...relatedProducts, ...tagMatches.slice(0, 1)];
        }
      }

      // Fill remaining slots with random products
      const remainingProducts = filteredProducts.filter(p => 
        !relatedProducts.some(rp => rp._id === p._id)
      );
      
      // Shuffle remaining products
      const shuffled = remainingProducts.sort(() => Math.random() - 0.5);
      relatedProducts = [...relatedProducts, ...shuffled.slice(0, 4 - relatedProducts.length)];

      setRelatedProducts(relatedProducts);
    } catch (error) {
      console.error('Error fetching related products:', error);
      setRelatedProducts([]);
    }
  };
  
  // Add function to fetch rating distribution
  const fetchRatingDistribution = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reviews/${id}/distribution`);
      setRatingDistribution(response.data);
    } catch (error) {
      console.error('Error fetching rating distribution:', error);
    }
  };

  // Update useEffect to fetch rating distribution
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/jewelry/${id}`);
        setProduct(response.data);
        setError('');
        // Fetch related products and rating distribution
        await Promise.all([
          fetchRelatedProducts(response.data),
          fetchRatingDistribution()
        ]);
      } catch (err) {
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);
  
  // Handle quantity update with optimistic updates
  const handleQuantityUpdate = async (newQuantity) => {
    if (newQuantity > 0 && newQuantity <= (product?.stock || 1)) {
      try {
        setIsUpdating(true);
        // Update the cart first
        await updateCartItemQuantity(product._id, newQuantity);
        // Then update local state
        setQuantity(newQuantity);
      } catch (error) {
        console.error('Error updating quantity:', error);
        setToastMessage('Failed to update quantity. Please try again.');
        setToastType('error');
        setShowToast(true);
        // Revert to the last known good quantity
        const cartItem = cart?.items?.find(item => item?.jewelry?._id === product._id);
        if (cartItem) {
          setQuantity(cartItem.quantity);
        }
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // Handle adding to cart
  const handleAddToCart = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (product && product.stock > 0 && product.isAvailable) {
      try {
        setIsAddingToCart(true);
        const success = await addToCart(product, quantity);
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
      } finally {
        setIsAddingToCart(false);
      }
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stock || 1)) {
      setQuantity(value);
    }
  };

  // Handle adding/removing from wishlist
  const handleWishlistToggle = async () => {
    if (product) {
      try {
        setIsTogglingWishlist(true);
        if (isInWishlist) {
          await removeFromWishlist(product._id);
        } else {
          await addToWishlist(product);
        }
      } catch (error) {
        console.error('Error toggling wishlist:', error);
      } finally {
        setIsTogglingWishlist(false);
      }
    }
  };
  
  // Rating data - will be replaced with actual rating data
  const ratingData = [
    { stars: 5, count: 25 },
    { stars: 4, count: 4 },
    { stars: 3, count: 0 },
    { stars: 2, count: 2 },
    { stars: 1, count: 2 },
  ];
  
  // Reviews data - will be replaced with actual reviews
  const reviews = [
    {
      id: 1,
      user: 'Ketan',
      date: '12 April 2024',
      rating: 5,
      comment: 'Perfect fitting , attractive print',
      helpful: 0,
    }
  ];
  
  // Function to render rating stars
  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`full-${i}`} className="text-yellow-400">★</span>
      );
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">★</span>
      );
    }

    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-yellow-400">☆</span>
      );
    }

    return stars;
  };

  // Function to determine stock status display
  const renderStockStatus = () => {
    if (!product) return null;
    
    if (!product.isAvailable) {
      return <span style={{ color: 'red', fontWeight: 'bold' }}>Currently Unavailable</span>;
    }
    
    if (product.stock <= 0) {
      return <span style={{ color: 'red', fontWeight: 'bold' }}>Out of Stock</span>;
    }
    
    if (product.stock <= 5) {
      return <span style={{ color: 'orange', fontWeight: 'bold' }}>Low Stock - Only {product.stock} left</span>;
    }
    
    return <span style={{ color: 'green', fontWeight: 'bold' }}>In Stock</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-[8px] p-4 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-2 md:px-4 py-4 md:py-6 pt-16 md:pt-16 mt-3 md:mt-0">
        <div className="font-sans max-w-7xl mx-auto p-1 sm:p-4">
          <div className="flex flex-col md:flex-row md:gap-6 mb-4 md:mb-6">
            <div className="flex flex-col w-full md:w-1/2 min-h-[520px] md:min-h-[1020px]">
              {/* Main Image Section - Top Half */}
              <div className="h-[400px] md:h-[800px] mb-3 md:mb-6">
                <div className="w-full h-full relative bg-gray-50 rounded-[8px] p-2 md:p-3 flex items-center justify-center">
                  {productMedia[selectedImage].type === 'video' ? (
                    <video 
                      src={productMedia[selectedImage].url} 
                      controls
                      className="max-w-full max-h-full object-contain rounded-[8px]" 
                    />
                  ) : (
                    <img 
                      src={productMedia[selectedImage].url} 
                      alt="Main product" 
                      className="max-w-full max-h-full object-contain rounded-[8px]" 
                    />
                  )}
                  {productMedia.length > 1 && (
                    <>
                      <button 
                        className={`absolute left-1 md:left-2.5 top-1/2 -translate-y-1/2 bg-white/80 border-none rounded-[6px] w-8 md:w-10 h-8 md:h-10 flex items-center justify-center cursor-pointer ${
                          selectedImage === 0 ? 'opacity-50' : 'opacity-100'
                        }`}
                        onClick={() => setSelectedImage(prev => Math.max(0, prev - 1))}
                        disabled={selectedImage === 0}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>
                      <button 
                        className={`absolute right-1 md:right-2.5 top-1/2 -translate-y-1/2 bg-white/80 border-none rounded-[6px] w-8 md:w-10 h-8 md:h-10 flex items-center justify-center cursor-pointer ${
                          selectedImage === productMedia.length - 1 ? 'opacity-50' : 'opacity-100'
                        }`}
                        onClick={() => setSelectedImage(prev => Math.min(productMedia.length - 1, prev + 1))}
                        disabled={selectedImage === productMedia.length - 1}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Thumbnails Section - Bottom Half */}
              <div className="h-[90px] md:h-[100px]">
                <div className="flex gap-2 md:gap-3 overflow-x-auto max-w-full md:max-w-[600px]">
                  {productMedia.map((media, index) => (
                    <div 
                      key={index} 
                      className={`min-w-[65px] w-[65px] h-[65px] md:min-w-[75px] md:w-[75px] md:h-[75px] border cursor-pointer overflow-hidden rounded-[6px] ${
                        selectedImage === index ? 'border-[rgb(165,97,108)] border-2 md:border-3' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      {media.type === 'video' ? (
                        <div className="relative w-full h-full">
                          <video 
                            src={media.url} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <img 
                          src={media.url} 
                          alt={`Product thumbnail ${index + 1}`} 
                          className="w-full h-full object-cover object-top" 
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex-1 mt-4 md:mt-0 w-full md:w-1/2">
              <h1 className="text-lg md:text-2xl font-bold mb-1">{product?.name || 'Product Name'}</h1>
              <p className="text-gray-600 text-sm md:text-base mb-3 md:mb-4">{product?.description || 'Product description'}</p>
              
              <div className="inline-flex items-center bg-gray-800 text-white px-2 md:px-2.5 py-1 md:py-1.5 rounded-[6px] mb-3 md:mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-4 md:h-4">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span className="ml-1 md:ml-1.5 text-sm md:text-base">{(product?.rating || 0).toFixed(1)}</span>
              </div>
              
              <div className="flex items-center gap-1.5 md:gap-2.5 mb-1">
                <span className="text-xl md:text-2xl font-bold">₹{product?.sellingPrice?.toFixed(2) || '0.00'}</span>
                {product?.price && (
                  <span className="line-through text-gray-500 text-sm md:text-base">₹{product.price.toFixed(2)}</span>
                )}
                <span className="text-sm md:text-base">{Math.round(((product.price - product.sellingPrice) / product.price) * 100)}% OFF</span>
              </div>
              
              <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-2.5">inclusive of all the taxes</p>
              
              {/* Stock Status */}
              <div className="mb-3 md:mb-5">
                {renderStockStatus()}
              </div>

              {/* Quantity Selector */}
              {product?.stock > 0 && product?.isAvailable && (
                <div className="mb-3 md:mb-5">
                  <label className="block mb-1 md:mb-2 text-sm md:text-base font-medium">Quantity:</label>
                  <div className="flex items-center gap-1.5 md:gap-2.5">
                    <button
                      onClick={() => handleQuantityUpdate(quantity - 1)}
                      disabled={quantity <= 1}
                      className={`w-8 h-8 md:w-9 md:h-9 border border-gray-200 rounded-l-[6px] bg-white ${
                        quantity > 1 ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-50'
                      }`}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => handleQuantityUpdate(parseInt(e.target.value))}
                      className="w-12 md:w-15 h-8 md:h-9 border border-gray-200 border-l-0 border-r-0 text-center bg-white text-gray-800 text-sm md:text-base"
                    />
                    <button
                      onClick={() => handleQuantityUpdate(quantity + 1)}
                      className={`w-8 h-8 md:w-9 md:h-9 border border-gray-200 rounded-r-[6px] bg-white ${
                        quantity < product.stock ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-50'
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
              
              {/* Categories */}
              <div className="mb-3 md:mb-5">
                <p className="font-medium mb-1 text-sm md:text-base">Categories:</p>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {product?.categories && product.categories.length > 0 ? 
                    product.categories.map((category, index) => (
                      <span 
                        key={index}
                        className="px-2 md:px-3 py-1 md:py-1.5 bg-gray-200 rounded-[8px] text-xs md:text-sm capitalize"
                      >
                        {category}
                      </span>
                    )) : 
                    <span className="text-gray-600 text-xs md:text-sm">No categories</span>
                  }
                </div>
              </div>

              {/* Tags */}
              <div className="mb-4 md:mb-5">
                <p className="font-medium mb-1 text-sm md:text-base">Tags:</p>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {product?.tags && product.tags.length > 0 ? 
                    product.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="px-2 md:px-3 py-1 md:py-1.5 bg-blue-50 text-blue-600 border border-blue-600 rounded-[6px] text-xs md:text-sm capitalize"
                      >
                        {tag}
                      </span>
                    )) : 
                    <span className="text-gray-600 text-xs md:text-sm">No tags</span>
                  }
                </div>
              </div>
              
              <div className="flex gap-2 md:gap-2.5 mb-5 md:mb-8">
                <button 
                  className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-[8px] ${
                    (product?.stock > 0 && product?.isAvailable) 
                      ? 'bg-[rgb(165,97,108)] text-white cursor-pointer' 
                      : 'bg-gray-300 text-white cursor-not-allowed'
                  } flex items-center justify-center gap-1.5 md:gap-2 text-sm md:text-base`}
                  onClick={handleAddToCart}
                  disabled={!product?.stock || product?.stock <= 0 || !product?.isAvailable || isAddingToCart}
                >
                  {isAddingToCart ? (
                    <svg className="animate-spin h-4 w-4 md:h-5 md:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : !currentUser ? (
                    <>
                      <FiLock className="w-4 h-4 md:w-5 md:h-5" />
                      Login to use cart
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-5 md:h-5">
                        <circle cx="8" cy="21" r="1" />
                        <circle cx="19" cy="21" r="1" />
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                      </svg>
                      Add to Cart
                    </>
                  )}
                </button>
                <button 
                  className={`py-2 md:py-3 px-3 md:px-4 bg-white ${
                    isInWishlist ? 'text-[rgb(165,97,108)]' : 'text-gray-800'
                  } border border-gray-200 rounded-[8px] flex items-center justify-center cursor-pointer`}
                  onClick={handleWishlistToggle}
                  disabled={isTogglingWishlist}
                >
                  {isTogglingWishlist ? (
                    <svg className="animate-spin h-4 w-4 md:h-5 md:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isInWishlist ? 'rgb(165,97,108)' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-5 md:h-5">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="mb-4 md:mb-5 border-t border-gray-200 pt-3 md:pt-4">
                <h2 className="text-base md:text-lg mb-2 md:mb-2.5">Product Specifications</h2>
                <table className="w-full border-collapse text-sm md:text-base">
                  <tbody>
                    <tr>
                      <td className="py-2 border-b border-gray-200 font-bold w-2/5">Categories</td>
                      <td className="py-2 border-b border-gray-200 capitalize">
                        {product?.categories && product.categories.length > 0 
                          ? product.categories.join(', ') 
                          : 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 border-b border-gray-200 font-bold">Tags</td>
                      <td className="py-2 border-b border-gray-200 capitalize">
                        {product?.tags && product.tags.length > 0 
                          ? product.tags.join(', ') 
                          : 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 border-b border-gray-200 font-bold">Availability</td>
                      <td className="py-2 border-b border-gray-200">{product?.isAvailable ? 'Yes' : 'No'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold">Rating</td>
                      <td className="py-2 flex items-center">
                        {renderRatingStars(product?.rating || 0)} 
                        <span className="ml-1.5">({(product?.rating || 0).toFixed(1)})</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <h2 className="text-lg mb-4">Product Description</h2>
                <p className="text-gray-800 leading-relaxed mb-4 whitespace-pre-line">
                  {product?.detailedDescription || 'Product description will be loaded here.'}
                </p>
              </div>
            </div>
          </div>
          
          {/* <div className="flex flex-col md:flex-row gap-5 mb-10 bg-gray-50 rounded-lg p-6">
            <div className="flex md:flex-col items-center gap-3 md:w-auto">
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-bold text-gray-900">{(product?.rating || 0).toFixed(1)}</h2>
                <span className="text-sm text-gray-600">out of 5</span>
              </div>
              <div className="flex items-center">
                <div className="flex">{renderRatingStars(product?.rating || 0)}</div>
                <p className="ml-2 text-sm text-gray-600">({product?.reviewCount || 0} ratings)</p>
              </div>
            </div>
            
            <div className="flex-1 md:ml-8">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingDistribution[stars] || 0;
                const total = Object.values(ratingDistribution).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? (count / total) * 100 : 0;
                
                return (
                  <div key={stars} className="flex items-center gap-2.5 mb-2">
                    <span className="w-8 text-sm font-medium">{stars}★</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="w-16 text-sm text-gray-600">({count} votes)</span>
                  </div>
                );
              })}
            </div>
          </div> */}
          
          {/* Add Review Section */}
          <ReviewSection
            productId={product._id}
            productRating={product?.rating}
            ratingDistribution={ratingDistribution}
            reviewCount={product?.reviewCount}
          />

          {/* Related Products Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            {relatedProducts.length > 0 ? (
              <div className="relative">
                <button 
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 shadow-md border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer z-10"
                  onClick={() => {
                    const container = document.getElementById('related-products-container');
                    container.scrollBy({ left: -200, behavior: 'smooth' });
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                
                <div 
                  id="related-products-container"
                  className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory hide-scrollbar"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  {relatedProducts.map(relatedProduct => {
                    const productImage = relatedProduct.imageUrls && relatedProduct.imageUrls.length > 0
                      ? (relatedProduct.imageUrls[0].startsWith('http') 
                          ? relatedProduct.imageUrls[0] 
                          : relatedProduct.imageUrls[0].startsWith('/uploads') 
                            ? `${API_BASE_URL}${relatedProduct.imageUrls[0]}`
                            : placeholderImage)
                      : placeholderImage;
                    
                    return (
                      <div 
                        key={relatedProduct._id} 
                        className="flex-none w-[160px] sm:w-[200px] snap-start border border-gray-200 rounded-[12px] overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300"
                        onClick={() => window.location.href = `/product/${relatedProduct._id}`}
                      >
                        <div className="h-36 overflow-hidden">
                          <img 
                            src={productImage} 
                            alt={relatedProduct.name} 
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-gray-900 mb-2 text-sm line-clamp-2">{relatedProduct.name}</h3>
                          <div className="flex items-center gap-1 mb-2">
                            <div className="flex text-sm">
                              {renderRatingStars(relatedProduct.rating || 0)}
                            </div>
                            <span className="text-xs text-gray-600 ml-1">({(relatedProduct.rating || 0).toFixed(1)})</span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-900 text-sm">₹{relatedProduct.sellingPrice?.toFixed(2) || '0.00'}</span>
                            {relatedProduct.price > relatedProduct.sellingPrice && (
                              <>
                                <span className="text-xs text-gray-500 line-through">₹{relatedProduct.price?.toFixed(2)}</span>
                                <span className="text-xs text-green-600">
                                  {Math.round(((relatedProduct.price - relatedProduct.sellingPrice) / relatedProduct.price) * 100)}% OFF
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button 
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 shadow-md border border-gray-200 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer z-10"
                  onClick={() => {
                    const container = document.getElementById('related-products-container');
                    container.scrollBy({ left: 200, behavior: 'smooth' });
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>
            ) : (
              <p className="text-center text-gray-600">No related products found.</p>
            )}
          </div>

          {/* Add this CSS to hide scrollbar but keep functionality */}
          <style>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>
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
    </div>
  );
}

export default ProductDetailsPage;