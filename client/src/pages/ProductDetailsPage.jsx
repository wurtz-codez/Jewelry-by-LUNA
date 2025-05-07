import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import placeholderImage from '../assets/placeholder.png';
import { useShop } from '../contexts/ShopContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { debounce } from 'lodash';
import Toast from '../components/Toast';

const API_BASE_URL = 'http://localhost:5001/api';

function ProductDetailsPage() {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedTab, setSelectedTab] = useState('Most Helpful');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, addToWishlist, removeFromWishlist, wishlist, cart, updateCartItemQuantity } = useShop();
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Check if product is in wishlist
  const isInWishlist = product && wishlist.some(item => item._id === product._id);

  // Get cart quantity for this product
  const cartQuantity = product ? cart?.items?.find(item => item?.jewelry?._id === product._id)?.quantity || 0 : 0;

  // Update quantity when product is loaded or cart changes
  useEffect(() => {
    if (product) {
      const cartItem = cart?.items?.find(item => item?.jewelry?._id === product._id);
      if (cartItem) {
        setQuantity(cartItem.quantity);
      } else {
        setQuantity(1);
      }
    }
  }, [product, cart]);
  
  // Get the product's images
  const getProductImages = () => {
    if (!product?.imageUrls || product.imageUrls.length === 0) {
      return [placeholderImage];
    }
    return product.imageUrls.map(url => 
      url.startsWith('http') ? url : url.startsWith('/uploads') ? `${API_BASE_URL}${url}` : placeholderImage
    );
  };

  const productImages = getProductImages();
  
  // Function to fetch related products
  const fetchRelatedProducts = async (product) => {
    try {
      if (!product) {
        setRelatedProducts([]);
        return;
      }

      // Fetch all products
      const response = await axios.get(`${API_BASE_URL}/jewelry`);
      if (!response.data || !Array.isArray(response.data)) {
        setRelatedProducts([]);
        return;
      }

      let filteredProducts = response.data.filter(p => p._id !== product._id);

      // First try to find products with matching categories
      if (product.categories?.length > 0) {
        const categoryMatches = filteredProducts.filter(p => 
          p.categories?.some(category => product.categories.includes(category))
        );
        if (categoryMatches.length >= 4) {
          setRelatedProducts(categoryMatches.slice(0, 4));
          return;
        }
      }

      // Then try to find products with matching tags
      if (product.tags?.length > 0) {
        const tagMatches = filteredProducts.filter(p => 
          p.tags?.some(tag => product.tags.includes(tag))
        );
        if (tagMatches.length >= 4) {
          setRelatedProducts(tagMatches.slice(0, 4));
          return;
        }
      }

      // If not enough matches, try to find new arrivals (products with "new arrival" tag)
      const newArrivals = filteredProducts.filter(p => 
        p.tags?.includes('new arrival')
      );
      if (newArrivals.length >= 4) {
        setRelatedProducts(newArrivals.slice(0, 4));
        return;
      }

      // If still not enough, get random products from different categories
      const uniqueCategories = new Set();
      const randomProducts = filteredProducts.filter(p => {
        if (p.categories?.length > 0 && !uniqueCategories.has(p.categories[0])) {
          uniqueCategories.add(p.categories[0]);
          return true;
        }
        return false;
      });

      if (randomProducts.length > 0) {
        setRelatedProducts(randomProducts.slice(0, 4));
        return;
      }

      // If all else fails, just take the first 4 products (excluding current)
      setRelatedProducts(filteredProducts.slice(0, 4));
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setRelatedProducts([]);
    }
  };
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/jewelry/${id}`);
        setProduct(response.data);
        setError('');
        // Fetch related products after product details are loaded
        await fetchRelatedProducts(response.data);
      } catch (err) {
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);
  
  // Handle quantity update with optimistic updates
  const handleQuantityUpdate = async (newQuantity) => {
    if (newQuantity > 0 && newQuantity <= (product?.stock || 1)) {
      try {
        setIsUpdating(true);
        // Update the cart first
        await updateCartItemQuantity(product._id, newQuantity);
        // Then update local state
        setQuantity(newQuantity);
      } catch (error) {
        console.error('Error updating quantity:', error);
        setToastMessage('Failed to update quantity. Please try again.');
        setToastType('error');
        setShowToast(true);
        // Revert to the last known good quantity
        const cartItem = cart?.items?.find(item => item?.jewelry?._id === product._id);
        if (cartItem) {
          setQuantity(cartItem.quantity);
        }
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // Handle adding to cart
  const handleAddToCart = async () => {
    if (product && product.stock > 0 && product.isAvailable) {
      try {
        const success = await addToCart(product, quantity);
        if (success) {
          setToastMessage(`${product.name} added to cart successfully!`);
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

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stock || 1)) {
      setQuantity(value);
    }
  };

  // Handle adding/removing from wishlist
  const handleWishlistToggle = () => {
    if (product) {
      if (isInWishlist) {
        removeFromWishlist(product._id);
      } else {
        addToWishlist(product);
      }
    }
  };
  
  // Rating data - will be replaced with actual rating data
  const ratingData = [
    { stars: 5, count: 25 },
    { stars: 4, count: 4 },
    { stars: 3, count: 0 },
    { stars: 2, count: 2 },
    { stars: 1, count: 2 },
  ];
  
  // Reviews data - will be replaced with actual reviews
  const reviews = [
    {
      id: 1,
      user: 'Ketan',
      date: '12 April 2024',
      rating: 5,
      comment: 'Perfect fitting , attractive print',
      helpful: 0,
    }
  ];
  
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<span key={i} style={{ color: '#FFD700', marginRight: '2px' }}>★</span>);
      } else if (i - 0.5 <= rating) {
        stars.push(<span key={i} style={{ color: '#FFD700', marginRight: '2px' }}>★</span>);
      } else {
        stars.push(<span key={i} style={{ color: '#FFD700', marginRight: '2px' }}>☆</span>);
      }
    }
    return stars;
  };

  // Function to determine stock status display
  const renderStockStatus = () => {
    if (!product) return null;
    
    if (!product.isAvailable) {
      return <span style={{ color: 'red', fontWeight: 'bold' }}>Currently Unavailable</span>;
    }
    
    if (product.stock <= 0) {
      return <span style={{ color: 'red', fontWeight: 'bold' }}>Out of Stock</span>;
    }
    
    if (product.stock <= 5) {
      return <span style={{ color: 'orange', fontWeight: 'bold' }}>Low Stock - Only {product.stock} left</span>;
    }
    
    return <span style={{ color: 'green', fontWeight: 'bold' }}>In Stock</span>;
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
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-neutral">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="font-sans max-w-7xl mx-auto p-5">
          <div className="flex gap-10 mb-10">
            <div className="flex gap-5 flex-1">
              <div className="flex flex-col gap-2.5 max-h-[400px] overflow-y-auto">
                {productImages.map((image, index) => (
                  <div 
                    key={index}
                    className={`w-20 h-20 border cursor-pointer overflow-hidden rounded ${
                      selectedImage === index ? 'border-[#8B4513]' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img 
                      src={image} 
                      alt={`Product thumbnail ${index + 1}`} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ))}
              </div>
              <div className="flex-1 max-w-[400px] relative">
                <img 
                  src={productImages[selectedImage]} 
                  alt="Main product" 
                  className="w-full h-auto object-cover rounded-lg" 
                />
                {productImages.length > 1 && (
                  <>
                    <button 
                      className={`absolute left-2.5 top-1/2 -translate-y-1/2 bg-white/80 border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer ${
                        selectedImage === 0 ? 'opacity-50' : 'opacity-100'
                      }`}
                      onClick={() => setSelectedImage(prev => Math.max(0, prev - 1))}
                      disabled={selectedImage === 0}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <button 
                      className={`absolute right-2.5 top-1/2 -translate-y-1/2 bg-white/80 border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer ${
                        selectedImage === productImages.length - 1 ? 'opacity-50' : 'opacity-100'
                      }`}
                      onClick={() => setSelectedImage(prev => Math.min(productImages.length - 1, prev + 1))}
                      disabled={selectedImage === productImages.length - 1}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">{product?.name || 'Product Name'}</h1>
              <p className="text-gray-600 mb-4">{product?.description || 'Product description'}</p>
              
              <div className="inline-flex items-center bg-gray-800 text-white px-2.5 py-1.5 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span className="ml-1.5">{product?.rating || '4.5'}</span>
              </div>
              
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-2xl font-bold">₹{product?.sellingPrice?.toFixed(2) || '0.00'}</span>
                {product?.price && (
                  <span className="line-through text-gray-500">₹{product.price.toFixed(2)}</span>
                )}
                {Math.round(((product.price - product.sellingPrice) / product.price) * 100)}% OFF
              </div>
              
              <p className="text-gray-600 mb-2.5 text-sm">inclusive of all the taxes</p>
              
              {/* Stock Status */}
              <div className="mb-5">
                {renderStockStatus()}
              </div>

              {/* Quantity Selector */}
              {product?.stock > 0 && product?.isAvailable && (
                <div className="mb-5">
                  <label className="block mb-2 font-medium">Quantity:</label>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => handleQuantityUpdate(quantity - 1)}
                      className={`w-9 h-9 border border-gray-200 rounded-l bg-white ${
                        quantity > 1 ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-50'
                      }`}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => handleQuantityUpdate(parseInt(e.target.value))}
                      className="w-15 h-9 border border-gray-200 border-l-0 border-r-0 text-center bg-white text-gray-800"
                    />
                    <button
                      onClick={() => handleQuantityUpdate(quantity + 1)}
                      className={`w-9 h-9 border border-gray-200 rounded-r bg-white ${
                        quantity < product.stock ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-50'
                      }`}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
              
              {/* Categories */}
              <div className="mb-5">
                <p className="font-medium mb-1">Categories:</p>
                <div className="flex flex-wrap gap-2">
                  {product?.categories && product.categories.length > 0 ? 
                    product.categories.map((category, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1.5 bg-gray-200 rounded-full text-sm capitalize"
                      >
                        {category}
                      </span>
                    )) : 
                    <span className="text-gray-600">No categories</span>
                  }
                </div>
              </div>

              {/* Tags */}
              <div className="mb-5">
                <p className="font-medium mb-1">Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {product?.tags && product.tags.length > 0 ? 
                    product.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-600 rounded-full text-sm capitalize"
                      >
                        {tag}
                      </span>
                    )) : 
                    <span className="text-gray-600">No tags</span>
                  }
                </div>
              </div>
              
              <div className="flex gap-2.5 mb-8">
                <button 
                  className={`flex-1 py-3 px-4 rounded ${
                    (product?.stock > 0 && product?.isAvailable) 
                      ? 'bg-[#8B4513] text-white cursor-pointer' 
                      : 'bg-gray-300 text-white cursor-not-allowed'
                  } flex items-center justify-center gap-2`}
                  onClick={handleAddToCart}
                  disabled={!product?.stock || product?.stock <= 0 || !product?.isAvailable}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8" cy="21" r="1" />
                    <circle cx="19" cy="21" r="1" />
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                  </svg>
                  {(product?.stock > 0 && product?.isAvailable) ? 'Add to Cart' : 'Out of Stock'}
                </button>
                <button 
                  className={`py-3 px-4 bg-white ${
                    isInWishlist ? 'text-pink-500' : 'text-gray-800'
                  } border border-gray-200 rounded flex items-center justify-center gap-2 cursor-pointer`}
                  onClick={handleWishlistToggle}
                >
                  {isInWishlist ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      Wishlisted
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      Wishlist
                    </>
                  )}
                </button>
              </div>

              <div className="mb-5 border-t border-gray-200 pt-4">
                <h2 className="text-lg mb-2.5">Product Specifications</h2>
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="py-2 border-b border-gray-200 font-bold w-2/5">Categories</td>
                      <td className="py-2 border-b border-gray-200 capitalize">
                        {product?.categories && product.categories.length > 0 
                          ? product.categories.join(', ') 
                          : 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 border-b border-gray-200 font-bold">Tags</td>
                      <td className="py-2 border-b border-gray-200 capitalize">
                        {product?.tags && product.tags.length > 0 
                          ? product.tags.join(', ') 
                          : 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 border-b border-gray-200 font-bold">Availability</td>
                      <td className="py-2 border-b border-gray-200">{product?.isAvailable ? 'Yes' : 'No'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold">Rating</td>
                      <td className="py-2 flex items-center">
                        {renderStars(product?.rating || 0)} 
                        <span className="ml-1.5">({product?.rating || '0'})</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <h2 className="text-lg mb-4">Product Description</h2>
                <p className="text-gray-800 leading-relaxed mb-4 whitespace-pre-line">
                  {product?.detailedDescription || 'Product description will be loaded here.'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-10 mb-10">
            <div className="text-center">
              <h2 className="text-2xl mb-2.5">{product?.rating || '4.5'}</h2>
              <div className="mb-2.5">{renderStars(product?.rating || 4.5)}</div>
              <p className="mb-2.5">33 ratings</p>
              <button className="py-2 px-4 bg-gray-800 text-white border-none rounded cursor-pointer">RATE</button>
            </div>
            
            <div className="flex-1">
              {ratingData.map(item => (
                <div key={item.stars} className="flex items-center gap-2.5 mb-1">
                  <span className="w-12">{item.stars} ★</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded">
                    <div 
                      className="h-full bg-yellow-400 rounded"
                      style={{ width: `${(item.count / 33) * 100}%` }}
                    ></div>
                  </div>
                  <span className="w-10">({item.count})</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h2 className="mb-5">You May Also Like</h2>
            
            {relatedProducts.length > 0 ? (
              <div className="relative">
                <button className="absolute -left-8 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                
                <div className="grid grid-cols-4 gap-5">
                  {relatedProducts.map(relatedProduct => {
                    const productImage = relatedProduct.imageUrls && relatedProduct.imageUrls.length > 0
                      ? (relatedProduct.imageUrls[0].startsWith('http') 
                          ? relatedProduct.imageUrls[0] 
                          : relatedProduct.imageUrls[0].startsWith('/uploads') 
                            ? `${API_BASE_URL}${relatedProduct.imageUrls[0]}`
                            : placeholderImage)
                      : placeholderImage;
                    
                    return (
                      <div key={relatedProduct._id} className="border border-gray-200 rounded overflow-hidden">
                        <div className="h-50 overflow-hidden">
                          <img src={productImage} alt={relatedProduct.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <p className="text-gray-600 mb-1">{relatedProduct.categories?.[0] || 'Jewelry'}</p>
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-yellow-400">★</span>
                            <span>{relatedProduct.rating || '0'}</span>
                          </div>
                          <p className="font-bold mb-2.5">₹{relatedProduct.sellingPrice?.toFixed(2) || '0.00'}</p>
                          <div className="flex gap-2.5">
                            <button 
                              className="bg-transparent border-none cursor-pointer p-1"
                              onClick={() => addToWishlist(relatedProduct)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                              </svg>
                            </button>
                            <button 
                              className="bg-transparent border-none cursor-pointer p-1"
                              onClick={() => addToCart(relatedProduct)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="8" cy="21" r="1" />
                                <circle cx="19" cy="21" r="1" />
                                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-600">No related products found.</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}

export default ProductDetailsPage;