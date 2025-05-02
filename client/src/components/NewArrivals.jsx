import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useShop } from '../contexts/ShopContext';
import { useAuth } from '../contexts/AuthContext';
import placeholderImage from '../assets/necklace-image.png';

const API_BASE_URL = 'http://localhost:5001/api';

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, addToWishlist, removeFromWishlist, wishlist } = useShop();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/jewelry`);
        const newArrivals = response.data
          .filter(product => product.tags?.includes('new arrival'))
          .slice(0, 4);
        setProducts(newArrivals);
      } catch (err) {
        console.error('Failed to fetch new arrivals:', err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchNewArrivals();
    }
  }, [currentUser]);

  const handleAddToCart = (product) => {
    addToCart(product);
    alert('Added to cart successfully!');
  };

  const handleWishlistToggle = (product) => {
    const isInWishlist = wishlist.some(item => item._id === product._id);
    if (isInWishlist) {
      removeFromWishlist(product._id);
      alert('Removed from wishlist');
    } else {
      addToWishlist(product);
      alert('Added to wishlist');
    }
  };

  // Don't render anything if user is not logged in
  if (!currentUser) {
    return null;
  }

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">New Arrivals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product._id} className="group relative">
              <Link to={`/product/${product._id}`}>
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                  <img
                    src={product.images?.[0]?.url || placeholderImage}
                    alt={product.name}
                    className="h-full w-full object-cover object-center group-hover:opacity-75"
                    onError={(e) => {
                      e.target.src = placeholderImage;
                    }}
                  />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{product.categories?.[0]}</p>
                  <p className="mt-1 text-lg font-medium text-gray-900">₹{product.price.toLocaleString('en-IN')}</p>
                </div>
              </Link>
              <div className="mt-4 flex justify-between">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddToCart(product);
                  }}
                  className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Add to Cart
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleWishlistToggle(product);
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {wishlist.some(item => item._id === product._id) ? '❤️' : '🤍'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals; 