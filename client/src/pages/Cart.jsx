import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiTrash2, FiShoppingBag, FiX, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { useShop } from '../contexts/ShopContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import placeholderImage from '../assets/placeholder.png';
import React, { useCallback } from 'react';
import { debounce } from 'lodash';
import { motion, AnimatePresence } from 'framer-motion';
import {
  pageAnimation,
  cartItemAnimation,
  orderSummaryAnimation,
  buttonHoverAnimation,
  buttonTapAnimation,
  quantityControlAnimation,
  emptyCartAnimation,
  priceUpdateAnimation,
  categoryTagAnimation,
  removeButtonAnimation
} from '../animations/cart';

const API_BASE_URL = 'https://jewelry-by-luna.onrender.com/api';

// Available coupon codes
const availableCoupons = [
  { code: 'WELCOME10', discount: 10, description: '10% off on your first purchase' },
  { code: 'SUMMER25', discount: 25, description: '25% off on summer collection' },
  { code: 'LUNA15', discount: 15, description: '15% off on all jewelry' },
];

// Payment methods
const paymentMethods = [
  { id: 'cod', name: 'Cash on Delivery' },
  { id: 'card', name: 'Credit/Debit Card' },
  { id: 'upi', name: 'UPI Payment' },
];

const Cart = () => {
  const { cart, removeFromCart, updateCartItemQuantity, fetchCart } = useShop();
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isUpdating, setIsUpdating] = useState({});
  const [isDeletingItem, setIsDeletingItem] = useState({});
  
  // State for checkout modal
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // State for shipping address
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    landmark: '',
    mobileNumber: ''
  });
  
  // State for coupon and payment
  const [selectedCoupon, setSelectedCoupon] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  // Field validation errors
  const [errors, setErrors] = useState({});

  // Calculate subtotal
  const subtotal = cart?.items?.reduce((total, item) => {
    const price = item?.jewelry?.sellingPrice || item?.jewelry?.price || 0;
    return total + (price * item.quantity);
  }, 0) || 0;
  
  // Shipping cost (could be calculated based on location, weight, etc.)
  const shipping = 60.00;
  
  // Calculate discount
  const getCouponDiscount = () => {
    if (!selectedCoupon) return 0;
    
    const coupon = availableCoupons.find(c => c.code === selectedCoupon);
    if (!coupon) return 0;
    
    return (subtotal * (coupon.discount / 100));
  };
  
  const discount = getCouponDiscount();
  
  // Total cost
  const total = subtotal + shipping - discount;

  // Debounced quantity update
  const debouncedUpdate = useCallback(
    debounce(async (productId, newQuantity) => {
      try {
        await updateCartItemQuantity(productId, newQuantity);
      } catch (error) {
        console.error('Error updating quantity:', error);
        setToastMessage('Failed to update quantity. Please try again.');
        setToastType('error');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
        // Revert to the last known good quantity
        await fetchCart();
      } finally {
        setIsUpdating(prev => ({ ...prev, [productId]: false }));
      }
    }, 500),
    [updateCartItemQuantity, fetchCart]
  );

  // Handle quantity update with optimistic updates
  const handleUpdateQuantity = (productId, newQuantity) => {
    const cartItem = cart?.items?.find(item => item.jewelry._id === productId);
    if (!cartItem) return;

    // Check if the new quantity is valid
    if (newQuantity > 0 && newQuantity <= (cartItem.jewelry.stock || 1) && !isUpdating[productId]) {
      setIsUpdating(prev => ({ ...prev, [productId]: true }));
      // Optimistically update the UI
      const updatedItems = cart.items.map(item => 
        item.jewelry._id === productId ? { ...item, quantity: newQuantity } : item
      );
      // Debounce the actual API call
      debouncedUpdate(productId, newQuantity);
    } else if (newQuantity > (cartItem.jewelry.stock || 1)) {
      setToastMessage(`Only ${cartItem.jewelry.stock} items available in stock`);
      setToastType('error');
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };

  // Remove item from cart
  const handleRemoveItem = async (id) => {
    try {
      setIsDeletingItem(prev => ({ ...prev, [id]: true }));
      await removeFromCart(id);
      setToastMessage('Item removed from cart successfully');
      setToastType('success');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      setToastMessage('Failed to remove item from cart');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsDeletingItem(prev => ({ ...prev, [id]: false }));
    }
  };
  
  // Handle shipping address change
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Open checkout modal
  const openCheckoutModal = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setShowCheckoutModal(true);
  };
  
  // Close checkout modal
  const closeCheckoutModal = () => {
    setShowCheckoutModal(false);
    setShippingAddress({
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      landmark: '',
      mobileNumber: ''
    });
    setSelectedCoupon('');
    setPaymentMethod('cod');
    setErrors({});
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!shippingAddress.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    
    if (!shippingAddress.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!shippingAddress.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!shippingAddress.zipCode.trim()) {
      newErrors.zipCode = 'Zip/Postal code is required';
    } else if (!/^\d{6}$/.test(shippingAddress.zipCode)) {
      newErrors.zipCode = 'Please enter a valid 6-digit zip code';
    }
    
    if (!shippingAddress.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(shippingAddress.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (!validateForm()) return;
    
    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // First, ensure the cart is synced with the server
      await fetchCart();

      // Log shipping address before sending to server
      console.log('Sending shipping address to server:', shippingAddress);

      // Then proceed with the order request with additional data
      const response = await axios.post(
        `${API_BASE_URL}/order/request`,
        {
          shippingAddress,
          paymentMethod,
          couponCode: selectedCoupon
        },
        {
          headers: { 'x-auth-token': token }
        }
      );

      // Handle WhatsApp redirection with better device detection
      const whatsappUrl = response.data.whatsappUrl;
      
      // Check if user is on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // For mobile users, try to open WhatsApp app directly
        window.location.href = whatsappUrl;
      } else {
        // For desktop users, try to open in a new tab
        const newWindow = window.open(whatsappUrl, '_blank');
        
        // If the window was blocked or failed to open, show a message with options
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          const fallbackMessage = (
            <div className="text-center">
              <p className="mb-2">Please choose one of these options to open WhatsApp:</p>
              <div className="space-y-2">
                <a 
                  href={whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                >
                  Open WhatsApp
                </a>
                <p className="text-sm text-gray-600">
                  If WhatsApp doesn't open automatically, please scan the QR code in WhatsApp Web or open WhatsApp on your phone.
                </p>
              </div>
            </div>
          );
          
          setToastMessage(fallbackMessage);
          setToastType('info');
          setShowToast(true);
        }
      }

      setToastMessage('Your order request has been sent successfully. Please complete the order on WhatsApp.');
      setToastType('success');
      setShowToast(true);
      
      // Close modal and reset states
      closeCheckoutModal();

      // Redirect to profile page after 2 seconds
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      console.error('Checkout error:', error);
      setToastMessage(error.response?.data?.message || 'Failed to send order request. Please try again.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsProcessing(false);
    }
  };

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

  // Debug function to test mobile number functionality
  const debugMobileNumber = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setToastMessage('Please log in first');
        setToastType('error');
        setShowToast(true);
        return;
      }

      // Test with a direct API call
      const testResponse = await axios.post(
        `${API_BASE_URL}/order/request`,
        {
          shippingAddress: {
            street: '123 Test Street',
            city: 'Test City',
            state: 'Test State',
            zipCode: '123456',
            country: 'India',
            mobileNumber: '9876543210'
          },
          paymentMethod: 'cod',
          couponCode: ''
        },
        {
          headers: { 'x-auth-token': token }
        }
      );

      console.log('Debug test response:', testResponse.data);
      
      // Check the latest order
      const latestOrderResponse = await axios.get(
        `${API_BASE_URL}/order/debug/latest`,
        {
          headers: { 'x-auth-token': token }
        }
      );
      
      console.log('Latest order debug data:', latestOrderResponse.data);
      
      setToastMessage('Debug test completed. Check console for results.');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Debug test error:', error);
      setToastMessage('Debug test failed. Check console for details.');
      setToastType('error');
      setShowToast(true);
    }
  };

  return (
    <motion.div 
      className="cart-page min-h-screen flex flex-col bg-white"
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
            Your Shopping Cart
          </motion.h1>
          
          {cart?.items?.filter(item => item?.jewelry).length > 0 ? (
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 md:gap-6 w-full justify-center items-center lg:items-start">
              {/* Cart Items */}
              <div className="w-full lg:w-[68%] max-w-2xl">
                <div className="bg-white rounded-lg">
                  <AnimatePresence>
                    <div className="space-y-2 sm:space-y-3">
                      {cart?.items?.filter(item => item?.jewelry).map(item => (
                        <motion.div 
                          key={item.jewelry._id}
                          variants={cartItemAnimation}
                          initial="initial"
                          animate="animate"
                        className="flex flex-row items-center gap-2 sm:gap-4 p-2 sm:p-3 md:p-4 rounded-lg bg-white shadow-md transition-colors"
                      >
                        <motion.div 
                          className="w-16 sm:w-24 md:w-32 h-16 sm:h-24 md:h-32 rounded-lg overflow-hidden flex-shrink-0"
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <img 
                            src={getImageUrl(item.jewelry)}
                            alt={item.jewelry.name} 
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => navigate(`/product/${item.jewelry._id}`)}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = placeholderImage;
                            }}
                          />
                        </motion.div>
                        
                        <div className="flex-grow">
                          <motion.h3 
                            className="text-sm sm:text-base md:text-lg lg:text-xl font-playfair-display font-medium text-gray-900 cursor-pointer hover:text-primary transition-colors line-clamp-1 sm:line-clamp-none"
                            onClick={() => navigate(`/product/${item.jewelry._id}`)}
                            whileHover={buttonHoverAnimation}
                            whileTap={buttonTapAnimation}
                          >
                            {item.jewelry.name}
                            {item.jewelry.discount > 0 && (
                              <motion.span 
                                className="ml-1 sm:ml-2 px-1 sm:px-2 py-0.5 text-xs sm:text-sm bg-green-100 text-green-700 rounded-md font-cinzel inline-block align-middle"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                              >
                                {Math.round(((item.jewelry.price - item.jewelry.sellingPrice) / item.jewelry.price) * 100)}% OFF
                              </motion.span>
                            )}
                          </motion.h3>
                          
                          {/* Product Description - Show only on larger screens */}
                          {item.jewelry.description && (
                            <p className="text-gray-600 text-xs sm:text-sm mt-0.5 sm:mt-1 mb-1 sm:mb-2 line-clamp-1 sm:line-clamp-2 hidden sm:block">
                              {item.jewelry.description}
                            </p>
                          )}
                          
                          {/* Categories and Tags - Show fewer on mobile */}
                          <div className="flex flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-2">
                            {item.jewelry.categories?.slice(0, window.innerWidth < 640 ? 1 : 3).map((category, index) => (
                              <motion.span 
                                key={index}
                                variants={categoryTagAnimation}
                                initial="initial"
                                animate="animate"
                                whileHover="hover"
                                className="px-1 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs bg-neutral/10 text-gray-700 rounded-md font-cinzel hover:bg-neutral/20 transition-colors border"
                              >
                                {category}
                              </motion.span>
                            ))}
                            {item.jewelry.categories?.length > (window.innerWidth < 640 ? 1 : 3) && (
                              <span className="px-1 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs text-gray-500">
                                +{item.jewelry.categories.length - (window.innerWidth < 640 ? 1 : 3)}
                              </span>
                            )}
                          </div>
                          
                          <div className="mt-2 sm:mt-4 flex flex-row items-center justify-between gap-1 sm:gap-3">
                            {/* Quantity Controls */}
                            <div className="flex items-center">
                              <motion.span 
                                className="text-xs sm:text-sm md:text-base lg:text-lg font-montserrat-alt px-2 sm:px-4 md:px-6 py-1 sm:py-2 rounded-lg bg-neutral/5"
                                variants={priceUpdateAnimation}
                                initial="initial"
                                animate="animate"
                                key={item.quantity}
                              >
                                {item.quantity}
                              </motion.span>
                            </div>
                            
                            {/* Price Calculation */}
                            <motion.div 
                              className="text-right"
                              variants={priceUpdateAnimation}
                              initial="initial"
                              animate="animate"
                              key={`${item.jewelry._id}-${item.quantity}`}
                            >
                              <div className="text-gray-600 text-xs sm:text-sm">
                                {item.jewelry.discount > 0 ? (
                                  <>
                                    <span className="line-through text-gray-400">₹{item.jewelry.price?.toLocaleString('en-IN')}</span>
                                    <span className="mx-1 sm:mx-2">→</span>
                                    <span className="text-green-600">₹{item.jewelry.sellingPrice?.toLocaleString('en-IN')}</span>
                                  </>
                                ) : (
                                  <span>₹{item.jewelry.sellingPrice?.toLocaleString('en-IN')}</span>
                                )} × {item.quantity}
                              </div>
                              <div className="text-sm sm:text-base md:text-lg lg:text-xl font-montserrat-alt text-gray-900 mt-0.5 sm:mt-1">
                                ₹{((item.jewelry.sellingPrice || item.jewelry.price || 0) * item.quantity).toLocaleString('en-IN')}
                              </div>
                            </motion.div>
                          </div>
                        </div>
                        
                        <motion.button 
                          onClick={() => handleRemoveItem(item.jewelry._id)}
                          className="p-1.5 sm:p-2 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors self-center disabled:opacity-50 disabled:cursor-not-allowed"
                          variants={removeButtonAnimation}
                          initial="initial"
                          animate="animate"
                          whileHover="hover"
                          disabled={isDeletingItem[item.jewelry._id]}
                        >
                          {isDeletingItem[item.jewelry._id] ? (
                            <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <FiTrash2 size={window.innerWidth < 640 ? 16 : 20} />
                          )}
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              </div>
            </div>
            
            {/* Order Summary */}
            <motion.div 
              className="w-full lg:w-[28%] mt-4 lg:mt-0 max-w-md"
              variants={orderSummaryAnimation}
              initial="initial"
              animate="animate"
            >
              <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 md:p-6 sticky top-24">
                <h2 className="text-lg sm:text-xl font-cinzel-decorative text-secondary mb-3 sm:mb-4">Order Summary</h2>
                
                <div className="space-y-3 sm:space-y-4 md:space-y-6">
                  <div className="flex justify-between text-gray-600 text-sm sm:text-base md:text-lg">
                    <span>Subtotal</span>
                    <motion.span
                      variants={priceUpdateAnimation}
                      initial="initial"
                      animate="animate"
                      key={subtotal}
                    >
                      ₹{subtotal.toLocaleString('en-IN')}
                    </motion.span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm sm:text-base md:text-lg">
                    <span>Shipping</span>
                    <span>₹{shipping.toLocaleString('en-IN')}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600 text-sm sm:text-base md:text-lg">
                      <span>Discount</span>
                      <motion.span
                        variants={priceUpdateAnimation}
                        initial="initial"
                        animate="animate"
                        key={discount}
                      >
                        -₹{discount.toLocaleString('en-IN')}
                      </motion.span>
                    </div>
                  )}
                  <div className="border-t pt-3 sm:pt-4 md:pt-6 mt-2 sm:mt-4 md:mt-6">
                    <div className="flex justify-between text-lg sm:text-xl md:text-2xl font-medium">
                      <span>Total</span>
                      <motion.span
                        variants={priceUpdateAnimation}
                        initial="initial"
                        animate="animate"
                        key={total}
                      >
                        ₹{total.toLocaleString('en-IN')}
                      </motion.span>
                    </div>
                  </div>
                </div>
                
                <motion.button 
                  onClick={openCheckoutModal}
                  className="w-full mt-4 sm:mt-6 md:mt-8 bg-primary text-white py-2 sm:py-3 md:py-4 px-3 sm:px-5 rounded-[12px] hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg font-medium"
                  whileHover={buttonHoverAnimation}
                  whileTap={buttonTapAnimation}
                >
                  <FiShoppingBag size={window.innerWidth < 640 ? 16 : 20} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  Proceed to Checkout
                </motion.button>
                
                <motion.button 
                  onClick={() => navigate('/shop')}
                  className="w-full mt-2 sm:mt-3 md:mt-4 bg-neutral text-gray-700 py-2 sm:py-3 md:py-4 px-3 sm:px-5 rounded-[12px] hover:bg-neutral/80 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg font-medium"
                  whileHover={buttonHoverAnimation}
                  whileTap={buttonTapAnimation}
                >
                  <FiArrowLeft size={window.innerWidth < 640 ? 16 : 20} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  Continue Shopping
                </motion.button>
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div 
            className="text-center py-8 sm:py-16 md:py-24 bg-white rounded-[16px] shadow-lg max-w-4xl mx-auto"
            variants={emptyCartAnimation}
            initial="initial"
            animate="animate"
          >
            <FiShoppingBag className="mx-auto text-gray-400 mb-4 sm:mb-6 md:mb-8 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
            <h2 className="text-xl sm:text-3xl md:text-4xl font-cinzel-decorative text-secondary mb-2 sm:mb-4 md:mb-6">Your cart is empty</h2>
            <p className="text-gray-500 mb-6 sm:mb-8 md:mb-10 text-base sm:text-lg md:text-xl px-4">Looks like you haven't added any jewelry to your cart yet.</p>
            <motion.button 
              onClick={() => navigate('/shop')}
              className="bg-primary text-white py-2 sm:py-3 md:py-4 px-4 sm:px-6 md:px-8 rounded-[12px] hover:bg-primary/90 transition-colors inline-flex items-center gap-1 sm:gap-2 md:gap-3 text-sm sm:text-base md:text-lg lg:text-xl font-medium"
              whileHover={buttonHoverAnimation}
              whileTap={buttonTapAnimation}
            >
              <FiArrowLeft size={window.innerWidth < 640 ? 16 : 24} className="sm:w-5 sm:h-5 md:w-7 md:h-7" />
              Continue Shopping
            </motion.button>
          </motion.div>
        )}
        </div>
      </div>
      
      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-[16px] p-2 sm:p-4 md:p-6 w-[95%] sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-2 sm:mb-4 border-b pb-2 sm:pb-4 sticky top-0 bg-white z-10">
              <h2 className="text-base sm:text-xl md:text-2xl font-cinzel-decorative text-secondary">Complete Your Order</h2>
              <button
                onClick={closeCheckoutModal}
                className="p-1 sm:p-2 rounded-[8px] hover:bg-neutral/10 transition-colors"
              >
                <FiX size={window.innerWidth < 640 ? 16 : 20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {/* Left column - Shipping & Payment */}
              <div>
                <h3 className="text-sm sm:text-lg font-cinzel-decorative text-secondary mb-2 sm:mb-4">Shipping Information</h3>
                
                <div className="space-y-2 sm:space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium text-xs sm:text-sm">Street Address*</label>
                    <input 
                      type="text" 
                      name="street" 
                      value={shippingAddress.street}
                      onChange={handleShippingChange}
                      placeholder="123 Main Street"
                      className={`w-full border ${errors.street ? 'border-red-500' : 'border-neutral-200'} rounded-[8px] px-2.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white`}
                    />
                    {errors.street && <p className="text-red-500 text-xs mt-0.5">{errors.street}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium text-xs sm:text-sm">Landmark (Optional)</label>
                    <input 
                      type="text" 
                      name="landmark" 
                      value={shippingAddress.landmark}
                      onChange={handleShippingChange}
                      placeholder="Near Bank, Behind Mall, etc."
                      className="w-full border border-neutral-200 rounded-[8px] px-2.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium text-xs sm:text-sm">Mobile Number*</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-2.5 py-2 bg-neutral/5 border border-r-0 border-neutral-200 rounded-l-[8px] text-xs sm:text-sm text-gray-500">
                        +91
                      </span>
                      <input 
                        type="text" 
                        name="mobileNumber" 
                        value={shippingAddress.mobileNumber}
                        onChange={handleShippingChange}
                        placeholder="9876543210"
                        className={`w-full border ${errors.mobileNumber ? 'border-red-500' : 'border-neutral-200'} rounded-r-[8px] px-2.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white`}
                      />
                    </div>
                    {errors.mobileNumber && <p className="text-red-500 text-xs mt-0.5">{errors.mobileNumber}</p>}
                  </div>
                  
                  {/* City and State in single row on mobile */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div>
                      <label className="block text-gray-700 mb-1 font-medium text-xs sm:text-sm">City*</label>
                      <input 
                        type="text" 
                        name="city" 
                        value={shippingAddress.city}
                        onChange={handleShippingChange}
                        placeholder="Mumbai"
                        className={`w-full border ${errors.city ? 'border-red-500' : 'border-neutral-200'} rounded-[8px] px-2.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white`}
                      />
                      {errors.city && <p className="text-red-500 text-xs mt-0.5">{errors.city}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-1 font-medium text-xs sm:text-sm">State*</label>
                      <input 
                        type="text" 
                        name="state" 
                        value={shippingAddress.state}
                        onChange={handleShippingChange}
                        placeholder="Maharashtra"
                        className={`w-full border ${errors.state ? 'border-red-500' : 'border-neutral-200'} rounded-[8px] px-2.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white`}
                      />
                      {errors.state && <p className="text-red-500 text-xs mt-0.5">{errors.state}</p>}
                    </div>
                  </div>
                  
                  {/* Postal Code and Country in single row on mobile */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div>
                      <label className="block text-gray-700 mb-1 font-medium text-xs sm:text-sm">Postal Code*</label>
                      <input 
                        type="text" 
                        name="zipCode" 
                        value={shippingAddress.zipCode}
                        onChange={handleShippingChange}
                        placeholder="400001"
                        className={`w-full border ${errors.zipCode ? 'border-red-500' : 'border-neutral-200'} rounded-[8px] px-2.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white`}
                      />
                      {errors.zipCode && <p className="text-red-500 text-xs mt-0.5">{errors.zipCode}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-1 font-medium text-xs sm:text-sm">Country</label>
                      <input 
                        type="text" 
                        name="country" 
                        value={shippingAddress.country}
                        onChange={handleShippingChange}
                        readOnly
                        className="w-full border border-neutral-200 rounded-[8px] px-2.5 py-2 text-xs sm:text-sm bg-neutral/5"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Order Summary */}
              <div>
                <h3 className="text-sm sm:text-lg font-cinzel-decorative text-secondary mb-2 sm:mb-4">Order Summary</h3>
                <div className="bg-neutral/5 rounded-[14px] p-2 sm:p-4">
                  {cart?.items?.filter(item => item?.jewelry).map(item => (
                    <div key={item.jewelry._id} className="flex items-center gap-2 mb-2 pb-2 border-b border-neutral-200 last:border-0 last:mb-0 last:pb-0">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-[6px] overflow-hidden">
                        <img 
                          src={getImageUrl(item.jewelry)}
                          alt={item.jewelry.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = placeholderImage;
                          }}
                        />
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium text-xs sm:text-sm line-clamp-1">{item.jewelry.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-xs sm:text-sm">₹{((item.jewelry.sellingPrice || item.jewelry.price || 0) * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                  
                  <div className="space-y-1 sm:space-y-2 pt-2 border-t border-neutral-200 mt-2">
                    <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                      <span>Shipping</span>
                      <span>₹{shipping.toLocaleString('en-IN')}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-xs sm:text-sm text-green-600">
                        <span>Discount</span>
                        <span>-₹{discount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium text-sm sm:text-base pt-1 sm:pt-2 border-t border-neutral-200 mt-1 sm:mt-2">
                      <span>Total</span>
                      <span>₹{total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 sm:mt-4 space-y-2">
                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className={`w-full py-2.5 sm:py-3 rounded-[8px] flex items-center justify-center gap-1.5 text-sm font-medium ${
                      isProcessing 
                        ? 'bg-neutral/50 text-gray-500 cursor-not-allowed' 
                        : 'bg-primary text-white hover:bg-primary/90'
                    } transition-colors`}
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FiCheck size={window.innerWidth < 640 ? 14 : 16} />
                        Confirm Order
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={closeCheckoutModal}
                    className="w-full py-1.5 sm:py-2 bg-neutral text-gray-700 rounded-[8px] hover:bg-neutral/80 transition-colors text-xs sm:text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
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
    </motion.div>
  );
};

export default Cart;