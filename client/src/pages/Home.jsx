import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import AboutUs from '../components/AboutUs';
import Collections from '../components/Collections';
import Footer from '../components/Footer';
import NewArrivals from '../components/NewArrivals';
import LoadingScreen from '../components/LoadingScreen';
import Toast from '../components/Toast';
import { useJewelryQuery } from '../hooks/useJewelryQuery';

const Home = () => {
  const { currentUser } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Use React Query with enabled: false to avoid initial fetch
  // We'll let the NewArrivals component handle the data fetching
  const { isLoading, isError } = useJewelryQuery(
    { limit: 8, sort: 'createdAt', order: 'desc' },
    { enabled: false }
  );

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load content. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
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