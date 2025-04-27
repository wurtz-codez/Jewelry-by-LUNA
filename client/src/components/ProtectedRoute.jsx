import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Toast from './Toast';
import { useState, useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const [showToast, setShowToast] = useState(false);
  
  useEffect(() => {
    if (!loading && !currentUser) {
      setShowToast(true);
    }
  }, [currentUser, loading]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!currentUser) {
    return (
      <>
        {showToast && (
          <Toast
            message="Please log in to access this page"
            type="warning"
            onClose={() => setShowToast(false)}
          />
        )}
        <Navigate to="/login" state={{ from: location }} replace />
      </>
    );
  }

  return children;
};

export default ProtectedRoute;