import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiTrash2, FiShoppingBag, FiX, FiCheck } from 'react-icons/fi';
import { useShop } from '../contexts/ShopContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';

const API_BASE_URL = 'http://localhost:5001/api';

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
    landmark: ''
  });
  
  // State for coupon and payment
  const [selectedCoupon, setSelectedCoupon] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  // Field validation errors
  const [errors, setErrors] = useState({});

  // Calculate subtotal
  const subtotal = cart.reduce((total, item) => total + (item.jewelry.price * item.quantity), 0);
  
  // Shipping cost (could be calculated based on location, weight, etc.)
  const shipping = 15.00;
  
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

  // Remove item from cart
  const handleRemoveItem = (id) => {
    removeFromCart(id);
  };

  // Update item quantity
  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartItemQuantity(id, newQuantity);
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
      landmark: ''
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

      setToastMessage('Your order request has been sent successfully. Waiting for admin approval.');
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

  return (
    <div className="cart-page min-h-screen flex flex-col">
      <Navbar />
      <div className="page-container py-10 px-4 max-w-6xl mx-auto flex-grow">
        <h1 className="text-3xl font-semibold mb-6">Shopping Cart</h1>
        
        {cart.length > 0 ? (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Cart Items */}
            <div className="md:w-2/3">
              <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left pb-4">Product</th>
                      <th className="text-center pb-4">Quantity</th>
                      <th className="text-right pb-4">Price</th>
                      <th className="text-right pb-4">Total</th>
                      <th className="text-right pb-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map(item => (
                      <tr key={item.jewelry._id} className="border-b">
                        <td className="py-4">
                          <div className="flex items-center">
                            <img 
                              src={
                                item.jewelry.imageUrl.startsWith('http') 
                                  ? item.jewelry.imageUrl 
                                  : item.jewelry.imageUrl.startsWith('/uploads') 
                                    ? `http://localhost:5001${item.jewelry.imageUrl}` 
                                    : `/src/assets/${item.jewelry.imageUrl}`
                              } 
                              alt={item.jewelry.name} 
                              className="w-16 h-16 object-cover rounded mr-4"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/src/assets/placeholder.svg';
                              }}
                            />
                            <span className="font-medium">{item.jewelry.name}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center justify-center">
                            <button 
                              onClick={() => handleUpdateQuantity(item.jewelry._id, item.quantity - 1)}
                              className="w-8 h-8 border rounded-l-md flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="w-10 h-8 border-t border-b flex items-center justify-center">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => handleUpdateQuantity(item.jewelry._id, item.quantity + 1)}
                              className="w-8 h-8 border rounded-r-md flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-4 text-right">₹{item.jewelry.price.toFixed(2)}</td>
                        <td className="py-4 text-right">₹{(item.jewelry.price * item.quantity).toFixed(2)}</td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => handleRemoveItem(item.jewelry._id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="md:w-1/3">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Shipping</span>
                  <span>₹{shipping.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between mb-2 font-semibold">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
                <button 
                  onClick={openCheckoutModal}
                  className="w-full mt-4 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition flex items-center justify-center gap-2"
                >
                  <FiShoppingBag />
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FiShoppingBag className="mx-auto text-gray-400 mb-4" size={50} />
            <h2 className="text-2xl font-medium mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added any jewelry to your cart yet.</p>
            <a href="/shop" className="bg-black text-white py-2 px-6 rounded-md hover:bg-gray-800 transition inline-block">
              Continue Shopping
            </a>
          </div>
        )}
      </div>
      
      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-semibold text-gray-800">Complete Your Order</h2>
              <button
                onClick={closeCheckoutModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left column - Shipping & Payment */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">Street Address*</label>
                    <input 
                      type="text" 
                      name="street" 
                      value={shippingAddress.street}
                      onChange={handleShippingChange}
                      placeholder="123 Main Street"
                      className={`w-full border ${errors.street ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
                    />
                    {errors.street && <p className="text-red-500 text-sm mt-1">{errors.street}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 mb-1 font-medium">Landmark (Optional)</label>
                    <input 
                      type="text" 
                      name="landmark" 
                      value={shippingAddress.landmark}
                      onChange={handleShippingChange}
                      placeholder="Near Bank, Behind Mall, etc."
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-1 font-medium">City*</label>
                      <input 
                        type="text" 
                        name="city" 
                        value={shippingAddress.city}
                        onChange={handleShippingChange}
                        placeholder="Mumbai"
                        className={`w-full border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-1 font-medium">State*</label>
                      <input 
                        type="text" 
                        name="state" 
                        value={shippingAddress.state}
                        onChange={handleShippingChange}
                        placeholder="Maharashtra"
                        className={`w-full border ${errors.state ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
                      />
                      {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 mb-1 font-medium">Postal Code*</label>
                      <input 
                        type="text" 
                        name="zipCode" 
                        value={shippingAddress.zipCode}
                        onChange={handleShippingChange}
                        placeholder="400001"
                        className={`w-full border ${errors.zipCode ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2`}
                      />
                      {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 mb-1 font-medium">Country</label>
                      <input 
                        type="text" 
                        name="country" 
                        value={shippingAddress.country}
                        onChange={handleShippingChange}
                        readOnly
                        className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mt-8 mb-4">Payment Method</h3>
                <div className="space-y-3">
                  {paymentMethods.map(method => (
                    <div key={method.id} className="flex items-center">
                      <input 
                        type="radio" 
                        id={method.id} 
                        name="payment-method"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        className="mr-2"
                      />
                      <label htmlFor={method.id} className="text-gray-700">{method.name}</label>
                    </div>
                  ))}
                </div>
                
                <h3 className="text-lg font-semibold mt-8 mb-4">Apply Coupon</h3>
                <div>
                  <select
                    value={selectedCoupon}
                    onChange={(e) => setSelectedCoupon(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select a coupon (optional)</option>
                    {availableCoupons.map(coupon => (
                      <option key={coupon.code} value={coupon.code}>
                        {coupon.code} - {coupon.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Right column - Order Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {cart.map(item => (
                    <div key={item.jewelry._id} className="flex justify-between mb-3 pb-3 border-b">
                      <div className="flex items-center">
                        <img 
                          src={
                            item.jewelry.imageUrl.startsWith('http') 
                              ? item.jewelry.imageUrl 
                              : item.jewelry.imageUrl.startsWith('/uploads') 
                                ? `http://localhost:5001${item.jewelry.imageUrl}` 
                                : `/src/assets/${item.jewelry.imageUrl}`
                          }
                          alt={item.jewelry.name} 
                          className="w-12 h-12 object-cover rounded mr-3"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/src/assets/placeholder.svg';
                          }}
                        />
                        <div>
                          <p className="font-medium">{item.jewelry.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium">₹{(item.jewelry.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span>₹{shipping.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-₹{discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 space-y-4">
                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className={`w-full py-3 rounded-md flex items-center justify-center ${
                      isProcessing 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-black hover:bg-gray-800'
                    } text-white`}
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FiCheck className="mr-2" />
                        Confirm Order
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={closeCheckoutModal}
                    className="w-full py-3 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
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
    </div>
  );
};

export default Cart;