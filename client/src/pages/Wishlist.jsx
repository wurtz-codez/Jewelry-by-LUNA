import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiTrash2, FiShoppingCart } from 'react-icons/fi';
import axios from 'axios';
import { useShop } from '../contexts/ShopContext';

const API_BASE_URL = 'http://localhost:5001/api';

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useShop();

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
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
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
    } catch (err) {
      setError('Failed to remove item from wishlist. Please try again later.');
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchWishlist}
              className="mt-4 bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
        
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">Your wishlist is empty</p>
            <button
              onClick={() => navigate('/shop')}
              className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
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
                          onClick={() => handleProductClick(item._id)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span 
                          className="font-medium"
                          onClick={() => handleProductClick(item._id)}
                          style={{ cursor: 'pointer' }}
                        >
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-right">₹{item.price.toFixed(2)}</td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="p-2 text-gray-600 hover:text-gray-900"
                          title="Add to Cart"
                        >
                          <FiShoppingCart size={20} />
                        </button>
                        <button
                          onClick={() => handleRemoveFromWishlist(item._id)}
                          className="p-2 text-red-500 hover:text-red-700"
                          title="Remove from Wishlist"
                        >
                          <FiTrash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Wishlist;