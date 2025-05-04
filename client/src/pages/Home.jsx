import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import AboutUs from '../components/AboutUs';
import Collections from '../components/Collections';
import Footer from '../components/Footer';
import NewArrivals from '../components/NewArrivals';
import LoadingScreen from '../components/LoadingScreen';
import axios from 'axios';
import Toast from '../components/Toast';

const API_BASE_URL = 'http://localhost:5001/api';

const Home = () => {
  const { currentUser } = useAuth();
  const [jewelry, setJewelry] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const fetchJewelry = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/jewelry`);
      setJewelry(response.data);
    } catch (error) {
      console.error('Error fetching jewelry:', error);
      setToastMessage('Failed to fetch jewelry items');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchJewelry();
  }, []);

  if (isInitialLoading) {
    return <LoadingScreen />;
  }

  return (
    <div>
      <Navbar />
      <Hero />
      <AboutUs />
      <NewArrivals />
      <Collections />
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
};

export default Home; 