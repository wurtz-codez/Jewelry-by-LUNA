import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiEdit, FiUser, FiShoppingBag, FiHeart, FiLogOut, FiX, FiLoader, FiMapPin, FiCreditCard } from 'react-icons/fi';
import Toast from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import LoadingScreen from '../components/LoadingScreen';

const API_BASE_URL = 'http://localhost:5001/api';

// Function to format payment method display
const formatPaymentMethod = (method) => {
  if (!method) return 'Not specified';
  
  switch(method) {
    case 'cod': return 'Cash on Delivery';
    case 'card': return 'Credit/Debit Card';
    case 'upi': return 'UPI Payment';
    default: return method;
  }
};

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
  
  // State for order details modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestType, setRequestType] = useState('');
  const [requestReason, setRequestReason] = useState('');
  const [requestImage, setRequestImage] = useState(null);
  const [selectedOrderForRequest, setSelectedOrderForRequest] = useState(null);
  const [existingRequests, setExistingRequests] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Add this new state for showing request status
  const [showRequestStatusModal, setShowRequestStatusModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setUser({
        ...user,
        name: currentUser.name,
        email: currentUser.email
      });
      fetchOrders();
      fetchUserRequests();
      setIsInitialLoading(false);
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
  
  const fetchUserRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/request/user`, {
        headers: { 'x-auth-token': token }
      });
      setExistingRequests(response.data);
    } catch (error) {
      console.error('Error fetching user requests:', error);
    }
  };
  
  // Fetch order details
  const fetchOrderDetails = async (orderId) => {
    try {
      setLoadingOrderDetails(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get(`${API_BASE_URL}/order/${orderId}`, {
        headers: { 'x-auth-token': token }
      });
      setSelectedOrder(response.data);
      setShowOrderModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setToastMessage('Failed to fetch order details');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoadingOrderDetails(false);
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

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/request/user`, {
        headers: { 'x-auth-token': token }
      });
      setExistingRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('orderId', selectedOrder._id);
      formData.append('type', requestType);
      formData.append('reason', requestReason);
      if (requestImage) {
        formData.append('image', requestImage);
      }

      const response = await axios.post(
        `${API_BASE_URL}/request`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );

      setToastMessage('Request submitted successfully');
      setToastType('success');
      setShowToast(true);
      setShowRequestModal(false);
      setRequestType('');
      setRequestReason('');
      setRequestImage(null);
      await fetchRequests();
    } catch (error) {
      console.error('Error submitting request:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit request';
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
      
      // If the error is about an existing request, show the request status
      if (errorMessage.includes('already have an active request')) {
        const existingRequest = existingRequests.find(req => 
          req.order._id === selectedOrder._id && !req.deleted
        );
        if (existingRequest) {
          setSelectedOrderForRequest(existingRequest);
          setRequestType('');
          setRequestReason('');
          setRequestImage(null);
          setShowRequestStatusModal(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const renderRequestStatus = (orderId) => {
    const request = existingRequests.find(req => req.order._id === orderId);
    if (!request) return null;

    return (
      <div className="mt-4">
        <h4 className="font-medium text-gray-700 mb-2">Request Status</h4>
        <div className={`px-3 py-2 rounded-lg ${
          request.status === 'approved' ? 'bg-green-100 text-green-800' :
          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          <p className="font-medium">Type: {request.type}</p>
          <p>Status: {request.status}</p>
          {request.adminResponse && (
            <p className="mt-2">Admin Response: {request.adminResponse}</p>
          )}
        </div>
      </div>
    );
  };

  if (isInitialLoading) {
    return <LoadingScreen />;
  }

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
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Order History</h2>
                    
                    {orders.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left pb-3">Order ID</th>
                              <th className="text-left pb-3">Date</th>
                              <th className="text-left pb-3">Status</th>
                              <th className="text-right pb-3">Total</th>
                              <th className="text-right pb-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.map(order => (
                              <tr key={order._id} className="border-b hover:bg-gray-50">
                                <td className="py-4">#{order._id.slice(-6)}</td>
                                <td className="py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="py-4">
                                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.requestStatus)}`}>
                                    {order.requestStatus}
                                  </span>
                                </td>
                                <td className="py-4 text-right">₹{order.totalAmount.toFixed(2)}</td>
                                <td className="py-4 text-right">
                                  <button 
                                    className="text-blue-500 hover:underline"
                                    onClick={() => fetchOrderDetails(order._id)}
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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
      
      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-4">
              <h3 className="text-lg font-medium text-gray-900">Order Details</h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowOrderModal(false)}
              >
                <FiX size={20} />
              </button>
            </div>

            {loadingOrderDetails ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin text-purple-500">
                  <FiLoader size={24} />
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <FiShoppingBag className="mr-2" /> Order Information
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p><span className="font-medium">Order ID:</span> {selectedOrder._id}</p>
                      <p><span className="font-medium">Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                      <p><span className="font-medium">Status:</span> 
                        <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          selectedOrder.requestStatus === 'approved' ? 'bg-green-100 text-green-800' :
                          selectedOrder.requestStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedOrder.requestStatus}
                        </span>
                      </p>
                      <p><span className="font-medium">Total Amount:</span> ₹{selectedOrder.totalAmount.toFixed(2)}</p>
                      <p><span className="font-medium">Payment Method:</span> {formatPaymentMethod(selectedOrder.paymentMethod)}</p>
                      <p><span className="font-medium">Payment Status:</span> 
                        <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          selectedOrder.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                          selectedOrder.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedOrder.paymentStatus || 'pending'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <FiMapPin className="mr-2" /> Shipping Information
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {selectedOrder.shippingAddress ? (
                        <>
                          <p className="font-medium mb-1">Delivery Address:</p>
                          <p>{selectedOrder.shippingAddress.street || 'No street address provided'}</p>
                          {selectedOrder.shippingAddress.landmark && (
                            <p>Landmark: {selectedOrder.shippingAddress.landmark}</p>
                          )}
                          <p>
                            {selectedOrder.shippingAddress.city || ''}{selectedOrder.shippingAddress.city && selectedOrder.shippingAddress.state ? ', ' : ''}
                            {selectedOrder.shippingAddress.state || ''}
                            {selectedOrder.shippingAddress.zipCode ? ' - ' + selectedOrder.shippingAddress.zipCode : ''}
                          </p>
                          <p>{selectedOrder.shippingAddress.country || ''}</p>
                        </>
                      ) : (
                        <p>No shipping address provided</p>
                      )}
                    </div>
                  </div>
                </div>

                <h4 className="font-medium text-gray-700 mb-2">Order Items</h4>
                <div className="overflow-x-auto bg-gray-50 rounded-lg mb-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items && selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {item.jewelry && typeof item.jewelry === 'object' && item.jewelry.imageUrl && (
                                <div className="h-12 w-12 flex-shrink-0 mr-4">
                                  <img 
                                    className="h-12 w-12 object-cover rounded-md" 
                                    src={
                                      item.jewelry.imageUrl.startsWith('http') 
                                        ? item.jewelry.imageUrl 
                                        : item.jewelry.imageUrl.startsWith('/uploads') 
                                          ? `${API_BASE_URL}${item.jewelry.imageUrl}` 
                                          : '/src/assets/placeholder.svg'
                                    }
                                    alt={item.jewelry.name}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = '/src/assets/placeholder.svg';
                                    }}
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                {item.jewelry && typeof item.jewelry === 'object' ? item.jewelry.name : 'Unknown Product'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            ₹{item.sellingPrice ? item.sellingPrice.toFixed(2) : '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            ₹{(item.sellingPrice * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100">
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-right font-medium">Total:</td>
                        <td className="px-6 py-4 font-medium">₹{selectedOrder.totalAmount.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {selectedOrder && selectedOrder.requestStatus === 'approved' && (
                  <div className="mt-6">
                    {renderRequestStatus(selectedOrder._id) || (
                      <>
                        <h4 className="font-medium text-gray-700 mb-2">Request Replacement/Refund</h4>
                        <div className="flex space-x-4">
                          <button
                            onClick={() => {
                              setSelectedOrderForRequest(selectedOrder);
                              setRequestType('replacement');
                              setShowRequestModal(true);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Request Replacement
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrderForRequest(selectedOrder);
                              setRequestType('refund');
                              setShowRequestModal(true);
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                          >
                            Request Refund
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      
      {showRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] mt-16">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-medium mb-4">Submit Request</h3>
            <form onSubmit={handleRequestSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Reason</label>
                <textarea
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="4"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setRequestImage(e.target.files[0])}
                  className="w-full"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRequestModal(false);
                    setRequestType('');
                    setRequestReason('');
                    setRequestImage(null);
                  }}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !requestType || !requestReason}
                  className={`px-4 py-2 bg-purple-600 text-white rounded-lg ${
                    loading || !requestType || !requestReason ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'
                  }`}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showRequestStatusModal && selectedOrderForRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] mt-16">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-medium mb-4">Request Status</h3>
            <div className="space-y-4">
              <div>
                <p className="font-medium">Type: {selectedOrderForRequest.type}</p>
                <p>Status: {selectedOrderForRequest.status}</p>
                {selectedOrderForRequest.adminResponse && (
                  <p className="mt-2">Admin Response: {selectedOrderForRequest.adminResponse}</p>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowRequestStatusModal(false);
                    setSelectedOrderForRequest(null);
                  }}
                  className="px-4 py-2 border rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
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