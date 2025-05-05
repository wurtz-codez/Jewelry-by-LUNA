import React from 'react';
import { Link } from 'react-router-dom';
import placeholderImage from '../necklace-image.png';

const ProductCard = ({ product, onAddToCart, onWishlistToggle, isInWishlist }) => {
  return (
    <div className="group flex flex-col w-[276px] h-[460px] border rounded-b-[20px] rounded-t-[32px]">
      {/* Product Image - 276x276 with top border radius of 32px */}
      <div className="w-[276px] h-[276px] overflow-hidden bg-gray-200 rounded-[32px]">
        <Link to={`/product/${product._id}`}>
          <img
            src={product.images?.[0]?.url || placeholderImage}
            alt={product.name}
            className="h-full w-full object-cover object-center group-hover:opacity-75"
            onError={(e) => {
              e.target.src = placeholderImage;
            }}
          />
        </Link>
      </div>
      
      {/* Product Details - in a container with bottom border radius of 20px */}
      <div className="mt-6 flex flex-col flex-grow rounded-b-[20px] bg-white px-3 pb-3">
        <Link to={`/product/${product._id}`} className="flex-grow">
          {/* Heading */}
          <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{product.name}</h3>
          
          {/* Category */}
          <p className="mt-1 text-sm font-cinzel text-secondary">{product.categories?.[0]}</p>
          
          {/* Price */}
          <p className="mt-2 text-2xl font-medium text-gray-900">₹{product.sellingPrice.toLocaleString('en-IN')}</p>
        </Link>
        
        {/* Action Buttons at the bottom */}
        <div className="mt-auto pt-3 flex justify-between items-center">
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart(product);
            }}
            className="bg-black text-white px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors text-sm"
          >
            Add to Cart
          </button>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              onWishlistToggle(product);
            }}
            className="text-gray-500 hover:text-gray-700 transition-colors text-xl"
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isInWishlist ? '❤️' : '🤍'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;