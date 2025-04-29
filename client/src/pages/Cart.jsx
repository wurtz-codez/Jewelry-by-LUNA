import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiTrash2, FiShoppingBag } from 'react-icons/fi';

const Cart = () => {
  // Mock cart data - in a real app this would come from state management
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Gold Necklace',
      price: 299.99,
      image: '/src/assets/necklace-image.png',
      quantity: 1
    },
    {
      id: 2,
      name: 'Silver Bracelet',
      price: 149.99,
      image: '/src/assets/bracelet-image.png',
      quantity: 2
    }
  ]);

  // Calculate subtotal
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Shipping cost (could be calculated based on location, weight, etc.)
  const shipping = 15.00;
  
  // Total cost
  const total = subtotal + shipping;

  // Remove item from cart
  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // Update item quantity
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  return (
    <div className="cart-page min-h-screen flex flex-col">
      <Navbar />
      <div className="page-container py-10 px-4 max-w-6xl mx-auto flex-grow">
        <h1 className="text-3xl font-semibold mb-6">Shopping Cart</h1>
        
        {cartItems.length > 0 ? (
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
                    {cartItems.map(item => (
                      <tr key={item.id} className="border-b">
                        <td className="py-4">
                          <div className="flex items-center">
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-16 h-16 object-cover rounded mr-4"
                            />
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center justify-center">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 border rounded-l-md flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="w-10 h-8 border-t border-b flex items-center justify-center">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 border rounded-r-md flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-4 text-right">₹{item.price.toFixed(2)}</td>
                        <td className="py-4 text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => removeItem(item.id)}
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
                <button className="w-full mt-4 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition flex items-center justify-center gap-2">
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
    </div>
  );
};

export default Cart;