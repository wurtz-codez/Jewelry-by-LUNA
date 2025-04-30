import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useShop } from '../contexts/ShopContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';

const API_BASE_URL = 'http://localhost:5001/api';

const Cart = () => {
  const { cart, removeFromCart, updateCartItemQuantity, fetchCart } = useShop();
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Calculate subtotal
  const subtotal = cart.reduce((total, item) => total + (item.jewelry.price * item.quantity), 0);
  
  // Shipping cost (could be calculated based on location, weight, etc.)
  const shipping = 15.00;
  
  // Total cost
  const total = subtotal + shipping;

  // Remove item from cart
  const handleRemoveItem = (id) => {
    removeFromCart(id);
  };

  // Update item quantity
  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    updateCartItemQuantity(id, newQuantity);
  };

  // Handle checkout
  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // First, ensure the cart is synced with the server
      await fetchCart();

      // Then proceed with the order request
      const response = await axios.post(
        `${API_BASE_URL}/order/request`,
        {},
        {
          headers: { 'x-auth-token': token }
        }
      );

      setToastMessage('Your order request has been sent successfully. Waiting for admin approval.');
      setToastType('success');
      setShowToast(true);

      // Redirect to profile page after 2 seconds
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      console.error('Checkout error:', error);
      setToastMessage(error.response?.data?.message || 'Failed to send order request. Please try again.');
      setToastType('error');
      setShowToast(true);
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
                  onClick={handleCheckout}
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