import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        console.log('Checking user with token:', token); // Debug log
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: {
            'x-auth-token': token
          }
        });
        
        console.log('User data received:', response.data); // Debug log
        setCurrentUser(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error verifying authentication:', err);
        console.error('Error details:', err.response?.data); // Debug log
        localStorage.removeItem('token');
        setCurrentUser(null);
        setLoading(false);
      }
    };
    
    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });
      
      const { token } = response.data;
      localStorage.setItem('token', token);
      
      // Get user data
      const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      setCurrentUser(userResponse.data);
      setError('');
      return true;
    } catch (err) {
      console.error('Login error:', err.response?.data); // Debug log
      setError(err.response?.data?.message || 'Failed to login');
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        email,
        password
      });
      
      const { token } = response.data;
      localStorage.setItem('token', token);
      
      // Get user data
      const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          'x-auth-token': token
        }
      });
      
      setCurrentUser(userResponse.data);
      setError('');
      return true;
    } catch (err) {
      console.error('Registration error:', err.response?.data); // Debug log
      setError(err.response?.data?.message || 'Failed to register');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
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