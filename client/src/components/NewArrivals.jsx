import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useShop } from '../contexts/ShopContext';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../assets/cards/ProductCard';

const API_BASE_URL = 'https://jewelry-by-luna.onrender.com/api';

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, addToWishlist, removeFromWishlist, wishlist } = useShop();
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/jewelry`);
        console.log('API Response:', response.data);
        const newArrivals = response.data.products
          .filter(product => product.tags?.includes('new arrival'))
          .slice(0, 4);
        console.log('Filtered New Arrivals:', newArrivals);
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
    <section className="py-8 sm:py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-cinzel text-center mb-8 sm:mb-12 md:mb-16">New Arrivals</h2>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                onWishlistToggle={handleWishlistToggle}
                isInWishlist={wishlist.some(item => item._id === product._id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;