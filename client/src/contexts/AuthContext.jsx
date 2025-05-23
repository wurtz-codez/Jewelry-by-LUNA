import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://jewelry-by-luna.onrender.com/api';
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in on mount
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const validateToken = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/validate`, {
        headers: { 'x-auth-token': token }
      });
      
      if (response.data.user) {
        setCurrentUser(response.data.user);
        return true;
      } else {
        throw new Error('Invalid user data');
      }
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.message === 'Account is banned') {
        handleBannedUser(error.response.data);
      } else {
        // Clear invalid token
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
      }
      return false;
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

  const login = async (email, password, isOTPLogin = false) => {
    try {
      setError(null);
      let endpoint = isOTPLogin ? 'verify-login-otp' : 'login';
      let data = isOTPLogin ? { email, otp: password } : { email, password };
      
      const response = await axios.post(`${API_BASE_URL}/auth/${endpoint}`, data);
      
      const { token: newToken, user } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setCurrentUser(user);
      return { success: true, user };
    } catch (error) {
      if (error.response?.status === 403 && error.response?.data?.message === 'Account is banned') {
        handleBannedUser(error.response.data);
        return { success: false, error: 'Account is banned' };
      }
      setError(error.response?.data?.message || 'Login failed');
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password, otp) => {
    try {
      setError(null);
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        email,
        password,
        otp
      });
      
      const { token: newToken, user } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setCurrentUser(user);
      return { success: true, user };
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    setError(null);
  };

  const value = {
    currentUser,
    token,
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