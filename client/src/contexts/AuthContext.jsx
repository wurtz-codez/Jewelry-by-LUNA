import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

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
        const response = await axios.get('http://localhost:5001/api/auth/me', {
          headers: {
            'x-auth-token': token
          }
        });
        
        setCurrentUser(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error verifying authentication:', err);
        localStorage.removeItem('token');
        setCurrentUser(null);
        setLoading(false);
      }
    };
    
    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', {
        email,
        password
      });
      
      const { token } = response.data;
      localStorage.setItem('token', token);
      
      // Get user data
      const userResponse = await axios.get('http://localhost:5001/api/auth/me', {
        headers: {
          'x-auth-token': token
        }
      });
      
      setCurrentUser(userResponse.data);
      setError('');
      return true;
    } catch (err) {
      setError(err.response?.data.msg || 'Failed to login');
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('http://localhost:5001/api/auth/register', {
        name,
        email,
        password
      });
      
      const { token } = response.data;
      localStorage.setItem('token', token);
      
      // Get user data
      const userResponse = await axios.get('http://localhost:5001/api/auth/me', {
        headers: {
          'x-auth-token': token
        }
      });
      
      setCurrentUser(userResponse.data);
      setError('');
      return true;
    } catch (err) {
      setError(err.response?.data.msg || 'Failed to register');
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