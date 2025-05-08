const API_BASE_URL = 'https://jewelry-by-luna.onrender.com';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  
  // Jewelry endpoints
  JEWELRY: `${API_BASE_URL}/api/jewelry`,
  JEWELRY_BY_ID: (id) => `${API_BASE_URL}/api/jewelry/${id}`,
  
  // Cart endpoints
  CART: `${API_BASE_URL}/api/cart`,
  CART_ITEM: (id) => `${API_BASE_URL}/api/cart/${id}`,
  
  // Wishlist endpoints
  WISHLIST: `${API_BASE_URL}/api/wishlist`,
  WISHLIST_ITEM: (id) => `${API_BASE_URL}/api/wishlist/${id}`,
  
  // Dashboard endpoints
  DASHBOARD: `${API_BASE_URL}/api/dashboard`,
};

// Helper function to make API calls
export const apiCall = async (endpoint, options = {}) => {
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(endpoint, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
}; 