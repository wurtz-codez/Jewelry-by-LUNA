import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Toast from './Toast';
import { useState, useEffect } from 'react';

const AdminRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  const [showToast, setShowToast] = useState(false);
  
  useEffect(() => {
    if (!loading && (!currentUser || currentUser.role !== 'admin')) {
      setShowToast(true);
    }
  }, [currentUser, loading]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <>
        {showToast && (
          <Toast
            message="Access denied. Admin privileges required."
            type="error"
            onClose={() => setShowToast(false)}
          />
        )}
        <Navigate to="/" state={{ from: location }} replace />
      </>
    );
  }

  return children;
};

export default AdminRoute; 