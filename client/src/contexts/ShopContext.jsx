import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const API_BASE_URL = 'http://localhost:5001/api';

const ShopContext = createContext();

const ShopProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const { currentUser } = useAuth();

  // Fetch cart and wishlist when user logs in
  useEffect(() => {
    if (currentUser) {
      fetchCart();
      fetchWishlist();
    } else {
      setCart([]);
      setWishlist([]);
    }
  }, [currentUser]);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/cart`, {
        headers: { 'x-auth-token': token }
      });
      setCart(response.data || { items: [] });
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart({ items: [] });
    }
  };

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/wishlist`, {
        headers: { 'x-auth-token': token }
      });
      setWishlist(response.data.items || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return false;
      }

      const response = await axios.post(
        `${API_BASE_URL}/cart/items`,
        { jewelryId: product._id, quantity },
        { headers: { 'x-auth-token': token } }
      );

      // Check if the response has data and items array
      if (response.data && Array.isArray(response.data.items)) {
        await fetchCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      return false;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.delete(
        `${API_BASE_URL}/cart/items/${productId}`,
        { headers: { 'x-auth-token': token } }
      );
      await fetchCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateCartItemQuantity = async (productId, quantity) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.put(
        `${API_BASE_URL}/cart/items/${productId}`,
        { quantity },
        { headers: { 'x-auth-token': token } }
      );
      await fetchCart();
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    }
  };

  const addToWishlist = async (product) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return false;
      }

      await axios.post(
        `${API_BASE_URL}/wishlist/items`,
        { jewelryId: product._id },
        { headers: { 'x-auth-token': token } }
      );
      await fetchWishlist();
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return false;
      }

      await axios.delete(
        `${API_BASE_URL}/wishlist/items/${productId}`,
        { headers: { 'x-auth-token': token } }
      );
      await fetchWishlist();
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  };

  const toggleWishlist = async (product) => {
    try {
      const isInWishlist = wishlist.some(item => item._id === product._id);
      if (isInWishlist) {
        return await removeFromWishlist(product._id);
      } else {
        return await addToWishlist(product);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      return false;
    }
  };

  const value = {
    cart,
    wishlist,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    fetchCart
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
};

const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

export { ShopProvider, useShop }; 