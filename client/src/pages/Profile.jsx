import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiEdit, FiUser, FiShoppingBag, FiHeart, FiLogOut } from 'react-icons/fi';
import Toast from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '(123) 456-7890',
    address: '123 Main St, New York, NY 10001'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [orders, setOrders] = useState([]);
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (currentUser) {
      setUser({
        ...user,
        name: currentUser.name,
        email: currentUser.email
      });
      fetchOrders();
    }
  }, [currentUser]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/order/user`, {
        headers: { 'x-auth-token': token }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {!currentUser ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Please log in to view your profile</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition"
            >
              Login
            </button>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Sidebar */}
              <div className="md:w-1/4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <FiUser size={24} className="text-gray-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{user.name}</h2>
                      <p className="text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <nav className="profile-nav">
                    <button 
                      className={`w-full text-left py-2 px-3 rounded mb-1 flex items-center gap-2 transition ${activeTab === 'profile' ? 'bg-gray-100 text-black' : 'hover:bg-gray-50'}`}
                      onClick={() => setActiveTab('profile')}
                    >
                      <FiUser /> Profile
                    </button>
                    <button 
                      className={`w-full text-left py-2 px-3 rounded mb-1 flex items-center gap-2 transition ${activeTab === 'orders' ? 'bg-gray-100 text-black' : 'hover:bg-gray-50'}`}
                      onClick={() => setActiveTab('orders')}
                    >
                      <FiShoppingBag /> Orders
                    </button>
                    <button 
                      className={`w-full text-left py-2 px-3 rounded mb-1 flex items-center gap-2 transition ${activeTab === 'wishlist' ? 'bg-gray-100 text-black' : 'hover:bg-gray-50'}`}
                      onClick={() => setActiveTab('wishlist')}
                    >
                      <FiHeart /> Wishlist
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left py-2 px-3 rounded mb-1 flex items-center gap-2 text-red-500 hover:bg-red-50 transition"
                    >
                      <FiLogOut /> Logout
                    </button>
                  </nav>
                </div>
              </div>
              
              {/* Main content */}
              <div className="md:w-3/4">
                {activeTab === 'profile' && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">Profile Information</h2>
                      <button className="text-blue-500 hover:text-blue-700">
                        <FiEdit size={20} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-500 mb-1">Name</label>
                        <p className="font-medium">{user.name}</p>
                      </div>
                      <div>
                        <label className="block text-gray-500 mb-1">Email</label>
                        <p className="font-medium">{user.email}</p>
                      </div>
                      <div>
                        <label className="block text-gray-500 mb-1">Phone</label>
                        <p className="font-medium">{user.phone}</p>
                      </div>
                      <div>
                        <label className="block text-gray-500 mb-1">Address</label>
                        <p className="font-medium">{user.address}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'orders' && (
                  <div className="orders-info">
                    <h2 className="text-xl font-semibold mb-4">Order History</h2>
                    
                    {orders.length > 0 ? (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left pb-2">Order ID</th>
                            <th className="text-left pb-2">Date</th>
                            <th className="text-left pb-2">Status</th>
                            <th className="text-right pb-2">Total</th>
                            <th className="text-right pb-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map(order => (
                            <tr key={order._id} className="border-b">
                              <td className="py-4">#{order._id.slice(-6)}</td>
                              <td className="py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                              <td className="py-4">
                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.requestStatus)}`}>
                                  {order.requestStatus}
                                </span>
                              </td>
                              <td className="py-4 text-right">₹{order.totalAmount.toFixed(2)}</td>
                              <td className="py-4 text-right">
                                <button className="text-blue-500 hover:underline">
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">You haven't placed any orders yet.</p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'wishlist' && (
                  <div className="wishlist-info">
                    <h2 className="text-xl font-semibold mb-4">My Wishlist</h2>
                    <p className="text-gray-500 mb-4">
                      <a href="/wishlist" className="text-blue-500 hover:underline">
                        Go to My Wishlist
                      </a> to view all your saved items.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
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

export default Profile;