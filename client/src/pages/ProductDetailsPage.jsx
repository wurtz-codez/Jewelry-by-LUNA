import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import placeholderImage from '../assets/necklace-image.png';
import { useShop } from '../contexts/ShopContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_BASE_URL = 'http://localhost:5001/api';

function ProductDetailsPage() {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedTab, setSelectedTab] = useState('Most Helpful');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { addToCart, addToWishlist, removeFromWishlist, wishlist } = useShop();
  
  // Check if product is in wishlist
  const isInWishlist = wishlist.some(item => item._id === product?._id);
  
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
  
  // Get the product's main image URL
  const mainImage = product?.imageUrl 
    ? (product.imageUrl.startsWith('http') 
        ? product.imageUrl 
        : product.imageUrl.startsWith('/uploads') 
          ? `${API_BASE_URL}${product.imageUrl}`
          : placeholderImage)
    : placeholderImage;
  
  // Handle adding to cart
  const handleAddToCart = () => {
    if (product && product.stock > 0 && product.isAvailable) {
      addToCart(product);
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
            <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div 
                  style={{
                    width: '80px',
                    height: '80px',
                    border: `1px solid #000`,
                    cursor: 'pointer',
                    overflow: 'hidden'
                  }}
                >
                  <img src={mainImage} alt="Product thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
                  <button style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '1px solid #e0e0e0',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 17V3" />
                      <path d="m6 11 6 6 6-6" />
                      <path d="M19 21H5" />
                    </svg>
                  </button>
                </div>
              </div>
              <div style={{ flex: 1, maxWidth: '400px' }}>
                <img src={mainImage} alt="Main product" style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{product?.name || 'Product Name'}</h1>
              <p style={{ color: '#666', margin: '0 0 15px 0' }}>{product?.description || 'Product description'}</p>
              
              <div style={{ display: 'inline-flex', alignItems: 'center', background: '#333', color: 'white', padding: '5px 10px', borderRadius: '20px', marginBottom: '15px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span style={{ marginLeft: '5px' }}>{product?.rating || '4.5'}</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{product?.sellingPrice?.toFixed(2) || '0.00'}</span>
                {product?.price && (
                  <span style={{ textDecoration: 'line-through', color: '#999' }}>₹{product.price.toFixed(2)}</span>
                )}
                {Math.round(((product.price - product.sellingPrice) / product.price) * 100)}% OFF
              </div>
              
              <p style={{ color: '#666', marginBottom: '10px', fontSize: '14px' }}>inclusive of all the taxes</p>
              
              {/* Stock Status */}
              <div style={{ marginBottom: '20px' }}>
                {renderStockStatus()}
              </div>
              
              {/* Categories */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontWeight: 'medium', marginBottom: '5px' }}>Categories:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {product?.categories && product.categories.length > 0 ? 
                    product.categories.map((category, index) => (
                      <span 
                        key={index}
                        style={{ 
                          padding: '6px 12px', 
                          background: '#e0e0e0',
                          borderRadius: '16px', 
                          fontSize: '14px',
                          textTransform: 'capitalize' 
                        }}
                      >
                        {category}
                      </span>
                    )) : 
                    <span style={{ color: '#666' }}>No categories</span>
                  }
                </div>
              </div>

              {/* Tags */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontWeight: 'medium', marginBottom: '5px' }}>Tags:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {product?.tags && product.tags.length > 0 ? 
                    product.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        style={{ 
                          padding: '6px 12px',
                          background: '#f0f8ff', 
                          color: '#1e90ff',
                          border: '1px solid #1e90ff',
                          borderRadius: '16px',
                          fontSize: '14px',
                          textTransform: 'capitalize'
                        }}
                      >
                        {tag}
                      </span>
                    )) : 
                    <span style={{ color: '#666' }}>No tags</span>
                  }
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                <button 
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: (product?.stock > 0 && product?.isAvailable) ? '#8B4513' : '#cccccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: (product?.stock > 0 && product?.isAvailable) ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
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
                  style={{
                    padding: '12px',
                    background: 'white',
                    color: isInWishlist ? '#FF4081' : '#333',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
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

              <div style={{ marginBottom: '20px', borderTop: '1px solid #e0e0e0', paddingTop: '15px' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Product Specifications</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px 0', borderBottom: '1px solid #e0e0e0', fontWeight: 'bold', width: '40%' }}>Categories</td>
                      <td style={{ padding: '8px 0', borderBottom: '1px solid #e0e0e0', textTransform: 'capitalize' }}>
                        {product?.categories && product.categories.length > 0 
                          ? product.categories.join(', ') 
                          : 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 0', borderBottom: '1px solid #e0e0e0', fontWeight: 'bold' }}>Tags</td>
                      <td style={{ padding: '8px 0', borderBottom: '1px solid #e0e0e0', textTransform: 'capitalize' }}>
                        {product?.tags && product.tags.length > 0 
                          ? product.tags.join(', ') 
                          : 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 0', borderBottom: '1px solid #e0e0e0', fontWeight: 'bold' }}>Availability</td>
                      <td style={{ padding: '8px 0', borderBottom: '1px solid #e0e0e0' }}>{product?.isAvailable ? 'Yes' : 'No'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Rating</td>
                      <td style={{ padding: '8px 0', display: 'flex', alignItems: 'center' }}>
                        {renderStars(product?.rating || 0)} 
                        <span style={{ marginLeft: '5px' }}>({product?.rating || '0'})</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Product Description</h2>
                <p style={{ color: '#333', lineHeight: '1.6', marginBottom: '15px', whiteSpace: 'pre-line' }}>
                  {product?.detailedDescription || 'Product description will be loaded here.'}
                </p>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '40px', marginBottom: '40px' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>{product?.rating || '4.5'}</h2>
              <div style={{ marginBottom: '10px' }}>{renderStars(product?.rating || 4.5)}</div>
              <p style={{ marginBottom: '10px' }}>33 ratings</p>
              <button style={{
                padding: '8px 16px',
                background: '#333',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>RATE</button>
            </div>
            
            <div style={{ flex: 1 }}>
              {ratingData.map(item => (
                <div key={item.stars} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                  <span style={{ width: '50px' }}>{item.stars} ★</span>
                  <div style={{ flex: 1, height: '8px', background: '#e0e0e0', borderRadius: '4px' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        background: '#FFD700',
                        borderRadius: '4px',
                        width: `${(item.count / 33) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span style={{ width: '40px' }}>({item.count})</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h2 style={{ marginBottom: '20px' }}>You May Also Like</h2>
            
            {relatedProducts.length > 0 ? (
              <div style={{ position: 'relative' }}>
                <button style={{
                  position: 'absolute',
                  left: '-30px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                  {relatedProducts.map(relatedProduct => {
                    const productImage = relatedProduct.imageUrl 
                      ? (relatedProduct.imageUrl.startsWith('http') 
                          ? relatedProduct.imageUrl 
                          : relatedProduct.imageUrl.startsWith('/uploads') 
                            ? `${API_BASE_URL}${relatedProduct.imageUrl}`
                            : placeholderImage)
                      : placeholderImage;
                    
                    return (
                      <div key={relatedProduct._id} style={{ border: '1px solid #e0e0e0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '200px', overflow: 'hidden' }}>
                          <img src={productImage} alt={relatedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ padding: '15px' }}>
                          <p style={{ color: '#666', marginBottom: '5px' }}>{relatedProduct.categories?.[0] || 'Jewelry'}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                            <span style={{ color: '#FFD700' }}>★</span>
                            <span>{relatedProduct.rating || '0'}</span>
                          </div>
                          <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>₹{relatedProduct.sellingPrice?.toFixed(2) || '0.00'}</p>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '5px'
                              }}
                              onClick={() => addToWishlist(relatedProduct)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                              </svg>
                            </button>
                            <button 
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '5px'
                              }}
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
              <p style={{ textAlign: 'center', color: '#666' }}>No related products found.</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ProductDetailsPage;