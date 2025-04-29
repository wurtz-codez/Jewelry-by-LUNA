import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiTrash2, FiShoppingCart } from 'react-icons/fi';
import { useShop } from '../contexts/ShopContext';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, addToCart } = useShop();

  // Calculate total cost
  const total = wishlist.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="wishlist-page min-h-screen flex flex-col">
      <Navbar />
      <div className="page-container py-10 px-4 max-w-6xl mx-auto flex-grow">
        <h1 className="text-3xl font-semibold mb-6">My Wishlist</h1>
        
        {wishlist.length > 0 ? (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Wishlist Items */}
            <div className="md:w-2/3">
              <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left pb-4">Product</th>
                      <th className="text-right pb-4">Price</th>
                      <th className="text-right pb-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wishlist.map(item => (
                      <tr key={item._id} className="border-b">
                        <td className="py-4">
                          <div className="flex items-center">
                            <img 
                              src={
                                item.imageUrl.startsWith('http') 
                                  ? item.imageUrl 
                                  : item.imageUrl.startsWith('/uploads') 
                                    ? `http://localhost:5001${item.imageUrl}` 
                                    : `/src/assets/${item.imageUrl}`
                              } 
                              alt={item.name} 
                              className="w-16 h-16 object-cover rounded mr-4"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/src/assets/placeholder.svg';
                              }}
                            />
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </td>
                        <td className="py-4 text-right">₹{item.price.toFixed(2)}</td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-4">
                            <button 
                              onClick={() => addToCart(item)}
                              className="bg-black text-white p-2 rounded-md hover:bg-gray-800 transition"
                              title="Add to Cart"
                            >
                              <FiShoppingCart size={18} />
                            </button>
                            <button 
                              onClick={() => removeFromWishlist(item._id)}
                              className="text-red-500 hover:text-red-700 p-2"
                              title="Remove"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
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
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                  <button 
                    className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition"
                    onClick={() => {
                      // Place order functionality will be added later
                      alert('Order functionality coming soon!');
                    }}
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">Your wishlist is empty.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;