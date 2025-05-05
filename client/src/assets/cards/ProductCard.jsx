import React from 'react';
import { Link } from 'react-router-dom';
import placeholderImage from '../necklace-image.png';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { motion } from 'framer-motion';
import {
  cardAnimation,
  imageAnimation,
  titleAnimation,
  discountBadgeAnimation,
  addToCartButtonAnimation,
  wishlistButtonAnimation,
  heartIconAnimation
} from '../../animations/productCard';

const ProductCard = ({ product, onAddToCart, onWishlistToggle, isInWishlist }) => {
  // Temporary values for design purposes
  const tempSellingPrice = 12999;
  const tempOriginalPrice = 15999;
  const tempDiscount = 18; // percentage

  return (
    <motion.div 
      initial={cardAnimation.initial}
      animate={cardAnimation.animate}
      transition={cardAnimation.transition}
      whileHover={cardAnimation.whileHover}
      className="group flex flex-col border rounded-b-[20px] rounded-t-[32px] w-full"
    >
      {/* Product Image - Responsive height with top border radius of 32px */}
      <motion.div 
        whileHover={imageAnimation.whileHover}
        transition={imageAnimation.transition}
        className="w-full aspect-square overflow-hidden bg-gray-200 rounded-[32px]"
      >
        <Link to={`/product/${product?._id || '#'}`}>
          <img
            src={product?.images?.[0]?.url || placeholderImage}
            alt={product?.name || "Jewelry Product"}
            className="h-full w-full object-cover object-center group-hover:opacity-75"
            onError={(e) => {
              e.target.src = placeholderImage;
            }}
          />
        </Link>
      </motion.div>

      {/* Product Details - in a container with bottom border radius of 20px */}
      <div className="mt-2 sm:mt-4 flex flex-col flex-grow rounded-b-[20px] bg-white px-2 sm:px-3 pb-2 sm:pb-3">
        <Link to={`/product/${product?._id || '#'}`} className="flex-grow">
          {/* Heading */}
          <motion.h3 
            whileHover={titleAnimation.whileHover}
            className="text-sm sm:text-lg font-bold text-gray-900 line-clamp-1"
          >
            {product?.name}
          </motion.h3>

          {/* Category */}
          <p className="mt-0.5 sm:mt-1 text-xs font-cinzel text-secondary">{product?.categories?.[0]}</p>

          {/* Price - showing both original price (striked through) and selling price */}
          <div className="mt-1 sm:mt-2 flex justify-between space-x-1 sm:space-x-2">
            {product.sellingPrice && product.sellingPrice < product.price ? (
              <>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <p className="text-sm sm:text-lg font-montserrat-alt font-medium text-gray-900">₹{product.sellingPrice.toLocaleString('en-IN')}</p>
                  <p className="text-xs sm:text-base font-montserrat-alt text-secondary-washed line-through">₹{product.price.toLocaleString('en-IN')}</p>
                </div>
                {product.price > 0 && product.sellingPrice > 0 && (
                  <motion.div 
                    initial={discountBadgeAnimation.initial}
                    animate={discountBadgeAnimation.animate}
                    className="bg-green-100 rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 text-center text-xs font-semibold text-green-800"
                  >
                    <span className="text-xs font-montserrat-alt text-green-600">
                      {Math.round((1 - product.sellingPrice / product.price) * 100)}% off
                    </span>
                  </motion.div>
                )}
              </>
            ) : (
              <p className="text-sm sm:text-lg font-montserrat-alt font-medium text-gray-900">₹{product.price.toLocaleString('en-IN')}</p>
            )}
          </div>
        </Link>
      </div>

      {/* Action Buttons at the bottom */}
      <div className="pt-2 sm:pt-3 flex gap-2 sm:gap-2 items-center">
        <motion.button
          whileHover={addToCartButtonAnimation.whileHover}
          whileTap={addToCartButtonAnimation.whileTap}
          onClick={(e) => {
            e.preventDefault();
            onAddToCart && onAddToCart(product);
          }}
          className="flex-1 bg-primary text-white text-sm sm:text-base md:text-xl py-2 sm:py-2 rounded-full hover:bg-white/0 hover:text-primary border hover:border-primary transition-colors"
        >
          Add to Cart
        </motion.button>

        <motion.button
          whileHover={wishlistButtonAnimation.whileHover}
          whileTap={wishlistButtonAnimation.whileTap}
          onClick={(e) => {
            e.preventDefault();
            onWishlistToggle && onWishlistToggle(product);
          }}
          className="text-white hover:text-primary transition-colors text-base bg-primary hover:bg-primary/0 border hover:border-primary aspect-square w-[36px] sm:w-[42px] rounded-full flex-shrink-0 flex items-center justify-center"
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <motion.div
            initial={heartIconAnimation.initial}
            animate={heartIconAnimation.animate(isInWishlist)}
            transition={heartIconAnimation.transition}
          >
            {isInWishlist ? <FaHeart className="text-white" /> : <FaRegHeart />}
          </motion.div>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProductCard;