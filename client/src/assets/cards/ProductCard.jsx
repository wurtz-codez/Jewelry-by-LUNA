import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import placeholderImage from '../placeholder.png';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { BiLoaderAlt } from 'react-icons/bi';
import { motion } from 'framer-motion';
import Toast from '../../components/Toast';
import { useShop } from '../../contexts/ShopContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  cardAnimation,
  imageAnimation,
  titleAnimation,
  discountBadgeAnimation,
  wishlistButtonAnimation,
  heartIconAnimation
} from '../../animations/productCard';

const API_BASE_URL = 'https://jewelry-by-luna.onrender.com/api';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toggleWishlist, wishlist } = useShop();
  const productData = product?.jewelry || product;
  const isOutOfStock = productData?.stock === 0;
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isLoading, setIsLoading] = useState(false);
  const isInWishlist = wishlist.some(item => item._id === productData?._id);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      setIsLoading(true);
      const success = await toggleWishlist(productData);
      if (success) {
        setToastMessage(
          isInWishlist 
            ? `${productData.name} removed from wishlist` 
            : `${productData.name} added to wishlist`
        );
        setToastType('success');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        setToastMessage('Failed to update wishlist');
        setToastType('error');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      console.error('Error in handleWishlistToggle:', error);
      setToastMessage('An error occurred. Please try again.');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsLoading(false);
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
        className={`group flex flex-col h-full border rounded-[8px] w-full bg-white ${isOutOfStock ? 'opacity-75' : ''}`}
      >
        {/* Product Image */}
        <motion.div 
          whileHover={imageAnimation.whileHover}
          transition={imageAnimation.transition}
          className="w-full aspect-square overflow-hidden bg-gray-200 rounded-t-[8px] relative"
        >
          <Link to={`/product/${productData?._id || '#'}`}>
            <img
              src={getImageUrl(productData)}
              alt={productData?.name || "Jewelry Product"}
              className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity duration-300"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = placeholderImage;
              }}
            />
          </Link>
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs sm:text-sm md:text-base font-bold bg-red-600 px-2 sm:px-3 py-1 sm:py-1.5 rounded-[4px] sm:rounded-[6px]">
                OUT OF STOCK
              </span>
            </div>
          )}
        </motion.div>

        {/* Product Details */}
        <div className="flex flex-col flex-grow p-1.5 sm:p-2 md:p-3">
          <Link to={`/product/${productData?._id || '#'}`} className="flex-grow">
            {/* Heading */}
            <motion.h3 
              whileHover={titleAnimation.whileHover}
              className="text-xs sm:text-sm md:text-base font-montserrat-alt font-medium text-gray-900 line-clamp-2"
            >
              {productData?.name || "Product Name"}
            </motion.h3>

            {/* Description */}
            {productData?.description && (
              <div className="mt-0.5 sm:mt-1">
                <p className="text-[10px] sm:text-xs md:text-sm text-gray-600 line-clamp-2 font-montserrat-alt">
                  {productData.description}
                </p>
              </div>
            )}
          </Link>

          {/* Price and Wishlist Button Row */}
          <div className="mt-1.5 sm:mt-2 md:mt-3 flex items-center justify-between">
            {/* Price and Discount */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {productData?.discount > 0 ? (
                <>
                  <motion.div 
                    whileHover={discountBadgeAnimation.whileHover}
                    className="flex items-center gap-1 sm:gap-1.5"
                  >
                    <span className="text-xs sm:text-sm md:text-base font-montserrat-alt font-medium text-gray-900">
                      ₹{productData?.sellingPrice?.toLocaleString('en-IN') || '0'}
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-500 line-through">
                      ₹{productData?.price?.toLocaleString('en-IN') || '0'}
                    </span>
                    <span className="text-[8px] sm:text-[10px] md:text-xs font-medium text-green-600">
                      {Math.round(((productData.price - productData.sellingPrice) / productData.price) * 100)}% OFF
                    </span>
                  </motion.div>
                </>
              ) : (
                <p className="text-xs sm:text-sm md:text-base font-montserrat-alt font-medium text-gray-900">
                  ₹{productData?.price?.toLocaleString('en-IN') || '0'}
                </p>
              )}
            </div>

            {/* Wishlist Button */}
            <motion.button
              whileHover={!isLoading && wishlistButtonAnimation.whileHover}
              whileTap={!isLoading && wishlistButtonAnimation.whileTap}
              onClick={!isLoading ? handleWishlistToggle : undefined}
              disabled={isLoading}
              className={`text-white hover:text-primary transition-colors text-xs sm:text-sm ${
                isInWishlist ? 'bg-primary/20 text-primary' : 'bg-primary'
              } hover:bg-primary/0 border hover:border-primary aspect-square w-[24px] sm:w-[28px] md:w-[32px] rounded-[4px] sm:rounded-[6px] flex-shrink-0 flex items-center justify-center ${
                isLoading ? 'cursor-not-allowed opacity-70' : ''
              }`}
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <motion.div
                whileHover={!isLoading && heartIconAnimation.whileHover}
                whileTap={!isLoading && heartIconAnimation.whileTap}
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4"
              >
                {isLoading ? (
                  <BiLoaderAlt className="w-full h-full animate-spin" />
                ) : isInWishlist ? (
                  <FaHeart className="w-full h-full" />
                ) : (
                  <FaRegHeart className="w-full h-full" />
                )}
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