import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import placeholderImage from '../placeholder.png';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Toast from '../../components/Toast';
import {
  cardAnimation,
  imageAnimation,
  titleAnimation,
  discountBadgeAnimation,
  addToCartButtonAnimation,
  wishlistButtonAnimation,
  heartIconAnimation
} from '../../animations/productCard';

const API_BASE_URL = 'http://localhost:5001/api';

const ProductCard = ({ product, onAddToCart, onWishlistToggle, isInWishlist }) => {
  // Get the actual product data, handling both direct and nested cases
  const productData = product?.jewelry || product;
  const isOutOfStock = productData?.stock === 0;
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isOutOfStock && onAddToCart) {
      try {
        const success = await onAddToCart(productData);
        if (success) {
          setToastMessage(`${productData.name} added to cart successfully!`);
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
      }
    }
  };

  const getImageUrl = (product) => {
    if (!product?.imageUrls || product.imageUrls.length === 0) return placeholderImage;
    
    const mainImage = product.imageUrls[0];
    if (mainImage.startsWith('http')) {
      return mainImage;
    }
    
    if (mainImage.startsWith('/uploads')) {
      return `${API_BASE_URL}${mainImage}`;
    }
    
    return placeholderImage;
  };

  return (
    <>
      <motion.div 
        initial={cardAnimation.initial}
        animate={cardAnimation.animate}
        transition={cardAnimation.transition}
        whileHover={cardAnimation.whileHover}
        className={`group flex flex-col h-full border rounded-b-[10px] rounded-t-[10px] w-full bg-white ${isOutOfStock ? 'opacity-75' : ''}`}
      >
        {/* Product Image - Responsive height with top border radius of 10px */}
        <motion.div 
          whileHover={imageAnimation.whileHover}
          transition={imageAnimation.transition}
          className="w-full aspect-square overflow-hidden bg-gray-200 rounded-[10px] relative"
        >
          <Link to={`/product/${productData?._id || '#'}`}>
            <img
              src={getImageUrl(productData)}
              alt={productData?.name || "Jewelry Product"}
              className="h-full w-full object-cover object-center group-hover:opacity-75"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = placeholderImage;
              }}
            />
          </Link>
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xl font-bold bg-red-600 px-4 py-2 rounded-[6px]">
                OUT OF STOCK
              </span>
            </div>
          )}
        </motion.div>

        {/* Product Details - in a container with bottom border radius of 10px */}
        <div className="mt-2 sm:mt-4 flex flex-col flex-grow rounded-b-[10px] bg-white px-2 sm:px-3 pb-2 sm:pb-3">
          <Link to={`/product/${productData?._id || '#'}`} className="flex-grow">
            {/* Heading */}
            <motion.h3 
              whileHover={titleAnimation.whileHover}
              className="text-sm sm:text-base md:text-lg font-montserrat-alt font-medium text-gray-900 line-clamp-2"
            >
              {productData?.name || "Product Name"}
            </motion.h3>

            {/* Category */}
            {productData?.categories && productData.categories.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {productData.categories.map((category, index) => (
                  <span 
                    key={index}
                    className="px-2 py-0.5 text-xs bg-neutral/10 text-gray-700 rounded-[6px] font-cinzel capitalize"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}

            {/* Price and Discount */}
            <div className="mt-1 sm:mt-2 flex items-center gap-2">
              {productData?.discount > 0 ? (
                <>
                  <motion.div 
                    whileHover={discountBadgeAnimation.whileHover}
                    className="flex items-center gap-2"
                  >
                    <span className="text-sm sm:text-base md:text-lg font-montserrat-alt font-medium text-gray-900">
                      ₹{productData?.sellingPrice?.toLocaleString('en-IN') || '0'}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 line-through">
                      ₹{productData?.price?.toLocaleString('en-IN') || '0'}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-green-600">
                      {Math.round(((productData.price - productData.sellingPrice) / productData.price) * 100)}% OFF
                    </span>
                  </motion.div>
                </>
              ) : (
                <p className="text-sm sm:text-lg font-montserrat-alt font-medium text-gray-900">₹{productData?.price?.toLocaleString('en-IN') || '0'}</p>
              )}
            </div>
          </Link>
        </div>

        {/* Action Buttons at the bottom */}
        <div className="mt-auto pt-2 sm:pt-3 flex flex-col gap-2">
          <div className="flex gap-2 sm:gap-2 items-center">
            <motion.button
              whileHover={!isOutOfStock ? addToCartButtonAnimation.whileHover : {}}
              whileTap={!isOutOfStock ? addToCartButtonAnimation.whileTap : {}}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 text-sm sm:text-base md:text-xl py-2 sm:py-2 rounded-[8px] transition-colors ${
                isOutOfStock 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-primary text-white hover:bg-white/0 hover:text-primary border hover:border-primary'
              }`}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </motion.button>

            <motion.button
              whileHover={wishlistButtonAnimation.whileHover}
              whileTap={wishlistButtonAnimation.whileTap}
              onClick={(e) => {
                e.preventDefault();
                onWishlistToggle && onWishlistToggle(productData);
              }}
              className="text-white hover:text-primary transition-colors text-base bg-primary hover:bg-primary/0 border hover:border-primary aspect-square w-[36px] sm:w-[42px] rounded-[8px] flex-shrink-0 flex items-center justify-center"
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <motion.div
                whileHover={heartIconAnimation.whileHover}
                whileTap={heartIconAnimation.whileTap}
              >
                {isInWishlist ? <FaHeart /> : <FaRegHeart />}
              </motion.div>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
};

export default ProductCard;