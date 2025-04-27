import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiSearch, FiShoppingCart, FiStar } from 'react-icons/fi';
import bannerImage from '../assets/Shop-page-banner.png';

const Shop = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    const dummyProducts = [
      {
        id: 1,
        name: 'Gold Necklace',
        description: 'Beautiful gold necklace with diamond pendant',
        price: 299.99,
        category: 'necklace',
        imageUrl: '/src/assets/necklace-image.png',
        rating: 4.5,
        stock: 10
      },
      {
        id: 2,
        name: 'Silver Bracelet',
        description: 'Elegant silver bracelet with charm',
        price: 149.99,
        category: 'bracelet',
        imageUrl: '/src/assets/bracelet-image.png',
        rating: 4.2,
        stock: 15
      },
      {
        id: 3,
        name: 'Diamond Earrings',
        description: 'Sparkling diamond earrings',
        price: 499.99,
        category: 'earring',
        imageUrl: '/src/assets/earrings-image.png',
        rating: 4.8,
        stock: 5
      },
      {
        id: 4,
        name: 'Pearl Earrings',
        description: 'Classic pearl earrings',
        price: 199.99,
        category: 'earring',
        imageUrl: '/src/assets/earrings-collection-image.png',
        rating: 4.0,
        stock: 8
      }
    ];
    
    setProducts(dummyProducts);
    setFilteredProducts(dummyProducts);
  }, []);
  
  // Filter products based on search, category, and price
  useEffect(() => {
    let result = products;
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Filter by price range
    result = result.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, priceRange, products]);
  
  // Handle adding to cart (would connect to state management in a real app)
  const handleAddToCart = (product) => {
    console.log('Added to cart:', product);
    // Here you would typically dispatch an action to add the item to cart
  };
  
  return (
    <div className="shop-page">
      <Navbar />
      
      {/* Shop Banner */}
      <div className="shop-banner">
        <img src={bannerImage} alt="Jewelry Collection" />
        {/* <div className="banner-text">
          <h1>Our Collection</h1>
          <p>Discover timeless elegance with our handcrafted jewelry pieces</p>
        </div> */}
      </div>
      
      {/* Search and Filters */}
      <div className="shop-controls">
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search for jewelry..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="category">Category:</label>
            <select 
              id="category" 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="necklace">Necklaces</option>
              <option value="bracelet">Bracelets</option>
              <option value="earring">Earrings</option>
              <option value="ring">Rings</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="price-min">Price Range:</label>
            <div className="price-inputs">
              <input
                type="number"
                id="price-min"
                min="0"
                max={priceRange[1]}
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              />
              <span>to</span>
              <input
                type="number"
                id="price-max"
                min={priceRange[0]}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Products Display */}
      <div className="products-container">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img src={product.imageUrl} alt={product.name} />
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <div className="product-rating">
                  <FiStar className="star-icon filled" />
                  <span>{product.rating.toFixed(1)}</span>
                </div>
                <p className="product-price">${product.price.toFixed(2)}</p>
                <button 
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock <= 0}
                >
                  <FiShoppingCart />
                  {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-products">
            <p>No products found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Shop;

