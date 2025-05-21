import React, { useMemo } from 'react';
import { useShop } from '../contexts/ShopContext';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../assets/cards/ProductCard';
import { useJewelryQuery } from '../hooks/useJewelryQuery';
import { FiLoader } from 'react-icons/fi';

const NewArrivals = () => {
  const { addToCart, addToWishlist, removeFromWishlist, wishlist } = useShop();
  const { currentUser } = useAuth();

  // Use React Query to fetch data
  const { data, isLoading, isError } = useJewelryQuery(
    { limit: 8, sort: 'createdAt', order: 'desc' },
    { enabled: !!currentUser }
  );

  // Extract and filter new arrivals
  const products = useMemo(() => {
    if (!data?.products) return [];
    return data.products
      .filter(product => product.tags?.includes('new arrival'))
      .slice(0, 4);
  }, [data]);

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

  if (isLoading) {
    return (
      <div className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-cinzel text-center mb-8 sm:mb-12 md:mb-16">New Arrivals</h2>
          <div className="flex justify-center">
            <div className="animate-spin text-primary">
              <FiLoader className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || products.length === 0) {
    return null;
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
                onAddToCart={() => handleAddToCart(product)}
                onWishlistToggle={() => handleWishlistToggle(product)}
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