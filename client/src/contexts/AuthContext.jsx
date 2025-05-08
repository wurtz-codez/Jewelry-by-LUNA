import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/validate`, {
        headers: { 'x-auth-token': token }
      });
      
      if (response.data.user) {
        setCurrentUser(response.data.user);
      } else {
        throw new Error('Invalid user data');
      }
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.message === 'Account is banned') {
        handleBannedUser(error.response.data);
      } else {
        // Clear invalid token
        localStorage.removeItem('token');
        setCurrentUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBannedUser = (data) => {
    logout();
    setError({
      message: 'Your account has been banned',
      details: {
        reason: data.banReason,
        expiry: data.banExpiry
      }
    });
  };

  const login = async (email, password) => {
    try {
      setError(null);
      console.log('Attempting login with:', { 
        email,
        passwordLength: password?.length,
        requestData: { email, password }
      });
      
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });
      
      console.log('Login response:', response.data);
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setCurrentUser(user);
      return { success: true, user };
    } catch (error) {
      console.error('Login error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        requestData: { email, passwordLength: password?.length }
      });
      
      if (error.response?.status === 403 && error.response?.data?.message === 'Account is banned') {
        handleBannedUser(error.response.data);
        return { success: false, error: 'Account is banned' };
      }
      setError(error.response?.data?.message || 'Login failed');
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      setError(null);
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        email,
        password
      });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setCurrentUser(user);
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      setError(error.response?.data?.message || 'Registration failed');
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setError(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;