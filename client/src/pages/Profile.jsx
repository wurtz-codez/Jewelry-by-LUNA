import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiEdit, FiUser, FiShoppingBag, FiHeart, FiLogOut, FiX, FiLoader, FiMapPin, FiCreditCard, FiCheck, FiUpload } from 'react-icons/fi';
import Toast from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import LoadingScreen from '../components/LoadingScreen';
import { motion } from 'framer-motion';

const API_BASE_URL = 'https://jewelry-by-luna.onrender.com/api';

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
    phone: '',
    address: ''
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
  const [requestImages, setRequestImages] = useState([]);
  const [requestImagePreviews, setRequestImagePreviews] = useState([]);
  const [requestVideos, setRequestVideos] = useState([]);
  const [requestVideoPreviews, setRequestVideoPreviews] = useState([]);
  const [selectedOrderForRequest, setSelectedOrderForRequest] = useState(null);
  const [existingRequests, setExistingRequests] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Add this new state for showing request status
  const [showRequestStatusModal, setShowRequestStatusModal] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    phone: '',
    address: ''
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]);

  useEffect(() => {
    if (currentUser) {
      const fetchUserProfile = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;

          const response = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: { 'x-auth-token': token }
          });

          // Log the response data to verify the structure
          console.log('User profile response:', response.data);

          // Ensure we're using the correct data structure and add null checks
          if (response.data) {
            setUser({
              name: response.data.name || '',
              email: response.data.email || '',
              phone: response.data.phone || '',
              address: response.data.address || ''
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setToastMessage('Failed to fetch user profile');
          setToastType('error');
          setShowToast(true);
        }
      };

      fetchUserProfile();
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
      
      console.log('Orders fetched:', response.data);
      if (response.data.length > 0) {
        console.log('First order ID:', response.data[0]._id);
        console.log('First order ID type:', typeof response.data[0]._id);
        console.log('First order ID length:', response.data[0]._id?.length);
      }
      
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
    console.log('=== fetchOrderDetails called ===');
    console.log('Received orderId:', orderId);
    console.log('Received orderId type:', typeof orderId);
    console.log('Received orderId length:', orderId?.length);
    
    try {
      setLoadingOrderDetails(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found in localStorage');
        setToastMessage('Authentication required');
        setToastType('error');
        setShowToast(true);
        return;
      }
      
      // Validate order ID
      if (!orderId || typeof orderId !== 'string' || orderId.length !== 24) {
        console.error('Invalid order ID:', orderId);
        setToastMessage('Invalid order ID');
        setToastType('error');
        setShowToast(true);
        return;
      }
      
      // Check if order ID matches MongoDB ObjectId pattern
      const objectIdPattern = /^[0-9a-fA-F]{24}$/;
      if (!objectIdPattern.test(orderId)) {
        console.error('Order ID does not match ObjectId pattern:', orderId);
        setToastMessage('Invalid order ID format');
        setToastType('error');
        setShowToast(true);
        return;
      }
      
      console.log('Fetching order details for orderId:', orderId);
      console.log('OrderId type:', typeof orderId);
      console.log('OrderId length:', orderId?.length);
      console.log('Token exists:', !!token);
      console.log('API URL:', `${API_BASE_URL}/order/${orderId}`);
      console.log('Full request URL:', new URL(`${API_BASE_URL}/order/${orderId}`).href);
      console.log('URL encoded orderId:', encodeURIComponent(orderId));
      console.log('Token first 10 chars:', token.substring(0, 10) + '...');
      console.log('Token length:', token.length);
      
      const response = await axios.get(`${API_BASE_URL}/order/${orderId}`, {
        headers: { 'x-auth-token': token }
      });
      
      console.log('Order details response:', response.data);
      setSelectedOrder(response.data);
      setShowOrderModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
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

  const handleImageUpload = async () => {
    if (requestImages.length === 0) {
      setToastMessage('Please select at least one image');
      setToastType('error');
      setShowToast(true);
      return;
    }

    setUploadingImage(true);
    try {
      const imageFormData = new FormData();
      requestImages.forEach(image => {
        imageFormData.append('images', image);
      });
      
      const uploadResponse = await axios.post(
        `${API_BASE_URL}/upload`,
        imageFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      
      setUploadedImageUrls(uploadResponse.data.filePaths);
      setToastMessage('Images uploaded successfully');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error uploading images:', error);
      setToastMessage('Failed to upload images');
      setToastType('error');
      setShowToast(true);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (requestImages.length === 0) {
      setToastMessage('Please select at least one image');
      setToastType('error');
      setShowToast(true);
      return;
    }

    setLoading(true);
    
    // Check if videos are being uploaded, show an informative message
    if (requestVideos.length > 0) {
      const totalVideoSizeMB = requestVideos.reduce(
        (size, file) => size + file.size / (1024 * 1024), 0
      ).toFixed(2);
      
      if (totalVideoSizeMB > 10) {
        setToastMessage(`Uploading ${totalVideoSizeMB}MB of videos. This may take a while...`);
        setToastType('info');
        setShowToast(true);
      }
    }
    
    try {
      const formData = new FormData();
      formData.append('orderId', selectedOrder._id);
      formData.append('type', requestType);
      formData.append('reason', requestReason);
      requestImages.forEach(image => {
        formData.append('images', image);
      });
      
      // Append videos if any
      requestVideos.forEach(video => {
        formData.append('videos', video);
      });

      const response = await axios.post(
        `${API_BASE_URL}/request`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': localStorage.getItem('token')
          },
          onUploadProgress: (progressEvent) => {
            if (requestVideos.length > 0) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              if (percentCompleted % 20 === 0) { // Update every 20% to avoid too many toasts
                setToastMessage(`Uploading: ${percentCompleted}% complete`);
                setToastType('info');
                setShowToast(true);
              }
            }
          },
          // Extend timeout for large uploads
          timeout: 300000 // 5 minutes
        }
      );

      setToastMessage('Request submitted successfully');
      setToastType('success');
      setShowToast(true);
      setShowRequestModal(false);
      setRequestType('');
      setRequestReason('');
      setRequestImages([]);
      setRequestImagePreviews([]);
      setRequestVideos([]);
      setRequestVideoPreviews([]);
      await fetchUserRequests();
    } catch (error) {
      console.error('Error submitting request:', error);
      let errorMessage;
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Your videos may be too large.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Server endpoint not found. Please try again later.';
      } else if (error.response?.status === 413) {
        errorMessage = 'Files too large. Please use smaller videos (under 50MB).';
      } else {
        errorMessage = error.response?.data?.message || 'Failed to submit request';
      }
      
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
      
      if (errorMessage.includes('already have an active request')) {
        const existingRequest = existingRequests.find(req => 
          req.order._id === selectedOrder._id && !req.deleted
        );
        if (existingRequest) {
          setSelectedOrderForRequest(existingRequest);
          setRequestType('');
          setRequestReason('');
          setRequestImages([]);
          setRequestImagePreviews([]);
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

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedUser({
      phone: user.phone,
      address: user.address
    });
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.put(
        `${API_BASE_URL}/auth/profile`,
        {
          phone: editedUser.phone,
          address: editedUser.address
        },
        {
          headers: { 'x-auth-token': token }
        }
      );

      setUser(prev => ({
        ...prev,
        phone: editedUser.phone,
        address: editedUser.address
      }));

      setToastMessage('Profile updated successfully');
      setToastType('success');
      setShowToast(true);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setToastMessage(error.response?.data?.message || 'Failed to update profile');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedUser({
      phone: user.phone,
      address: user.address
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to handle video uploads with enhanced validation
  const handleVideoFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Check if files are valid videos
    const invalidFiles = files.filter(file => !file.type.startsWith('video/'));
    if (invalidFiles.length > 0) {
      setToastMessage('Please select valid video files only');
      setToastType('error');
      setShowToast(true);
      return;
    }

    // Check file count limit
    if (files.length + requestVideos.length > 2) {
      setToastMessage('You can only upload up to 2 videos');
      setToastType('error');
      setShowToast(true);
      return;
    }
    
    // Check file sizes - large files may cause issues
    const MAX_SIZE_MB = 50; // 50MB
    const oversizedFiles = files.filter(file => file.size > MAX_SIZE_MB * 1024 * 1024);
    
    if (oversizedFiles.length > 0) {
      setToastMessage(`Some videos exceed ${MAX_SIZE_MB}MB. Upload may fail or be slow.`);
      setToastType('warning');
      setShowToast(true);
    }
    
    // Add files to state
    setRequestVideos(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      // Calculate file size in MB
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setRequestVideoPreviews(prev => [...prev, {
          url: reader.result,
          name: file.name,
          type: file.type,
          size: fileSizeMB + ' MB'
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  if (isInitialLoading) {
    return <LoadingScreen />;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar variant="white" />
        <div className="page-container py-24 sm:py-24 md:py-24 lg:py-32 mx-4 sm:mx-6 md:mx-12 lg:mx-32 max-w-8xl flex-grow">
          <motion.div 
            className="text-center py-16 sm:py-24 bg-white rounded-[16px] shadow-lg max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FiUser className="mx-auto text-gray-400 mb-6 sm:mb-8 sm:w-20 sm:h-20" size={60} />
            <h2 className="text-3xl sm:text-4xl font-cinzel-decorative text-secondary mb-4 sm:mb-6">Please Log In</h2>
            <p className="text-gray-500 mb-8 sm:mb-10 text-lg sm:text-xl">You need to be logged in to view your profile</p>
            <motion.button 
              onClick={() => navigate('/login')}
              className="bg-primary text-white py-4 sm:py-5 px-8 sm:px-10 rounded-[12px] hover:bg-primary/90 transition-colors inline-flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Login
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar variant="white" />
      <div className="page-container py-24 sm:py-24 md:py-24 lg:py-32 mx-4 sm:mx-6 md:mx-12 lg:mx-32 max-w-8xl flex-grow">
        <motion.h1 
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-cinzel-decorative text-secondary text-center mb-8 sm:mb-12 md:mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          My Profile
        </motion.h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <motion.div 
            className="md:w-1/3 lg:w-1/4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white rounded-[16px] shadow-lg p-6 sm:p-8 md:p-6 lg:p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 md:w-20 md:h-20 lg:w-20 lg:h-20 bg-neutral rounded-[16px] flex items-center justify-center">
                  <FiUser size={24} className="md:w-8 md:h-8 lg:w-8 lg:h-8 text-gray-500" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl lg:text-2xl font-cinzel-decorative text-secondary">{user?.name || 'User'}</h2>
                  <p className="text-sm md:text-base lg:text-base text-gray-500">{user?.email || ''}</p>
                </div>
              </div>
              <nav className="space-y-2">
                <motion.button 
                  className={`w-full text-left py-3 md:py-4 lg:py-4 px-4 md:px-6 lg:px-6 rounded-[12px] flex items-center gap-3 transition ${
                    activeTab === 'profile' 
                      ? 'bg-primary text-white' 
                      : 'bg-neutral hover:bg-neutral/80 text-gray-700'
                  }`}
                  onClick={() => setActiveTab('profile')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiUser size={18} className="md:w-5 md:h-5 lg:w-5 lg:h-5" /> Profile
                </motion.button>
                <motion.button 
                  className={`w-full text-left py-3 md:py-4 lg:py-4 px-4 md:px-6 lg:px-6 rounded-[12px] flex items-center gap-3 transition ${
                    activeTab === 'orders' 
                      ? 'bg-primary text-white' 
                      : 'bg-neutral hover:bg-neutral/80 text-gray-700'
                  }`}
                  onClick={() => setActiveTab('orders')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiShoppingBag size={18} className="md:w-5 md:h-5 lg:w-5 lg:h-5" /> Orders
                </motion.button>
                <motion.button 
                  className={`w-full text-left py-3 md:py-4 lg:py-4 px-4 md:px-6 lg:px-6 rounded-[12px] flex items-center gap-3 transition ${
                    activeTab === 'wishlist' 
                      ? 'bg-primary text-white' 
                      : 'bg-neutral hover:bg-neutral/80 text-gray-700'
                  }`}
                  onClick={() => setActiveTab('wishlist')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiHeart size={18} className="md:w-5 md:h-5 lg:w-5 lg:h-5" /> Wishlist
                </motion.button>
                <motion.button 
                  onClick={handleLogout}
                  className="w-full text-left py-3 md:py-4 lg:py-4 px-4 md:px-6 lg:px-6 rounded-[12px] flex items-center gap-3 bg-red-50 text-red-500 hover:bg-red-100 transition"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FiLogOut size={18} className="md:w-5 md:h-5 lg:w-5 lg:h-5" /> Logout
                </motion.button>
              </nav>
            </div>
          </motion.div>
          
          {/* Main content */}
          <motion.div 
            className="md:w-2/3 lg:w-3/4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {activeTab === 'profile' && (
              <div className="bg-white rounded-[16px] shadow-lg p-6 sm:p-8 md:p-6 lg:p-8">
                <div className="flex justify-between items-center mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl lg:text-2xl font-cinzel-decorative text-secondary">Profile Information</h2>
                  {!isEditing ? (
                    <motion.button 
                      onClick={handleEditClick}
                      className="p-2 md:p-3 lg:p-3 rounded-[12px] bg-neutral hover:bg-neutral/80 text-gray-700 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FiEdit size={18} className="md:w-5 md:h-5 lg:w-5 lg:h-5" />
                    </motion.button>
                  ) : (
                    <div className="flex gap-2">
                      <motion.button 
                        onClick={handleSaveChanges}
                        className="p-2 md:p-3 lg:p-3 rounded-[12px] bg-primary hover:bg-primary/90 text-white transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FiCheck size={18} className="md:w-5 md:h-5 lg:w-5 lg:h-5" />
                      </motion.button>
                      <motion.button 
                        onClick={handleCancelEdit}
                        className="p-2 md:p-3 lg:p-3 rounded-[12px] bg-neutral hover:bg-neutral/80 text-gray-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FiX size={18} className="md:w-5 md:h-5 lg:w-5 lg:h-5" />
                      </motion.button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-500 mb-2 font-medium">Name</label>
                      <div className="p-4 bg-neutral/5 rounded-[8px]">
                        <p className="font-medium text-gray-900">{user.name}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-2 font-medium">Email</label>
                      <div className="p-4 bg-neutral/5 rounded-[8px]">
                        <p className="font-medium text-gray-900">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-500 mb-2 font-medium">Phone</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={editedUser.phone}
                          onChange={handleInputChange}
                          className="w-full p-4 border border-neutral-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                          placeholder="Enter your phone number"
                        />
                      ) : (
                        <div className="p-4 bg-neutral/5 rounded-[8px]">
                          <p className="font-medium text-gray-900">
                            {user.phone ? user.phone : (
                              <span className="text-gray-500 italic">Add your phone number</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-2 font-medium">Address</label>
                      {isEditing ? (
                        <textarea
                          name="address"
                          value={editedUser.address}
                          onChange={handleInputChange}
                          className="w-full p-4 border border-neutral-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                          placeholder="Enter your address"
                          rows="3"
                        />
                      ) : (
                        <div className="p-4 bg-neutral/5 rounded-[8px]">
                          <p className="font-medium text-gray-900">
                            {user.address ? user.address : (
                              <span className="text-gray-500 italic">Add your address</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'orders' && (
              <div className="bg-white rounded-[16px] shadow-lg p-6 sm:p-8 md:p-6 lg:p-8">
                <h2 className="text-xl md:text-2xl lg:text-2xl font-cinzel-decorative text-secondary mb-6 md:mb-8">Order History</h2>
                
                {orders.length > 0 ? (
                  <div className="space-y-4 md:space-y-6">
                    {orders.map(order => (
                      <motion.div 
                        key={order._id}
                        className="bg-neutral/5 rounded-[12px] p-4 md:p-6 hover:shadow-md transition-shadow"
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4">
                          <div>
                            <h3 className="text-base md:text-lg lg:text-lg font-medium text-gray-900">Order #{order._id.slice(-6)}</h3>
                            <p className="text-sm md:text-base lg:text-base text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-3 md:gap-4">
                            <span className={`px-3 md:px-4 py-1 md:py-2 rounded-[8px] text-xs md:text-sm font-medium ${
                              order.requestStatus === 'approved' ? 'bg-green-100 text-green-800' :
                              order.requestStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.requestStatus}
                            </span>
                            <span className="text-base md:text-lg lg:text-lg font-medium">₹{order.totalAmount.toFixed(2)}</span>
                            <motion.button 
                              onClick={() => {
                                console.log('Full order ID:', order._id);
                                console.log('Order ID length:', order._id?.length);
                                console.log('Order ID type:', typeof order._id);
                                console.log('Order ID hex pattern:', /^[0-9a-fA-F]{24}$/.test(order._id));
                                fetchOrderDetails(order._id);
                              }}
                              className="px-3 md:px-4 py-1 md:py-2 bg-primary text-white rounded-[8px] hover:bg-primary/90 transition-colors text-sm md:text-base"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              View Details
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 md:py-16">
                    <FiShoppingBag className="mx-auto text-gray-400 mb-4 md:mb-6 md:w-12 md:h-12 lg:w-12 lg:h-12" size={40} />
                    <p className="text-base md:text-lg lg:text-lg text-gray-500">You haven't placed any orders yet.</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-[16px] shadow-lg p-6 sm:p-8 md:p-6 lg:p-8">
                <h2 className="text-xl md:text-2xl lg:text-2xl font-cinzel-decorative text-secondary mb-6 md:mb-8">My Wishlist</h2>
                <div className="text-center py-12 md:py-16">
                  <FiHeart className="mx-auto text-gray-400 mb-4 md:mb-6 md:w-12 md:h-12 lg:w-12 lg:h-12" size={40} />
                  <p className="text-base md:text-lg lg:text-lg text-gray-500 mb-6 md:mb-8">View and manage your saved items in your wishlist.</p>
                  <motion.button 
                    onClick={() => navigate('/wishlist')}
                    className="bg-primary text-white py-3 md:py-4 px-6 md:px-8 rounded-[12px] hover:bg-primary/90 transition-colors inline-flex items-center gap-2 text-base md:text-lg font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Go to Wishlist
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-[16px] p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="flex justify-between items-center mb-8 border-b pb-6">
              <h3 className="text-2xl font-cinzel-decorative text-secondary">Order Details</h3>
              <motion.button
                className="p-3 rounded-[12px] hover:bg-neutral/10 transition-colors"
                onClick={() => setShowOrderModal(false)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiX size={24} />
              </motion.button>
            </div>

            {loadingOrderDetails ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin text-primary">
                  <FiLoader size={32} />
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <FiShoppingBag className="text-primary" /> Order Information
                    </h4>
                    <div className="bg-neutral/5 rounded-[12px] p-6 space-y-4">
                      <p><span className="font-medium">Order ID:</span> {selectedOrder._id}</p>
                      <p><span className="font-medium">Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                      <p><span className="font-medium">Status:</span> 
                        <span className={`ml-2 px-3 py-1 rounded-[8px] text-sm font-medium ${
                          selectedOrder.requestStatus === 'approved' ? 'bg-green-100 text-green-800' :
                          selectedOrder.requestStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedOrder.requestStatus}
                        </span>
                      </p>
                      <p><span className="font-medium">Items Total:</span> ₹{selectedOrder.items.reduce((total, item) => 
                        total + ((item.jewelry?.sellingPrice || item.jewelry?.price || 0) * item.quantity), 0).toLocaleString('en-IN')}
                      </p>
                      {selectedOrder.items.reduce((total, item) => 
                        total + ((item.jewelry?.sellingPrice || item.jewelry?.price || 0) * item.quantity), 0) > selectedOrder.totalAmount && (
                        <p><span className="font-medium">Coupon Discount:</span> 
                          <span className="text-green-600">
                            -₹{(selectedOrder.items.reduce((total, item) => 
                              total + ((item.jewelry?.sellingPrice || item.jewelry?.price || 0) * item.quantity), 0) - selectedOrder.totalAmount).toLocaleString('en-IN')}
                          </span>
                        </p>
                      )}
                      <p><span className="font-medium">Total Amount:</span> ₹{selectedOrder.totalAmount.toLocaleString('en-IN')}</p>
                      <p><span className="font-medium">Payment Method:</span> {formatPaymentMethod(selectedOrder.paymentMethod)}</p>
                      <p><span className="font-medium">Payment Status:</span> 
                        <span className={`ml-2 px-3 py-1 rounded-[8px] text-sm font-medium ${
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
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <FiMapPin className="text-primary" /> Shipping Information
                    </h4>
                    <div className="bg-neutral/5 rounded-[12px] p-6">
                      {selectedOrder.shippingAddress ? (
                        <div className="space-y-3">
                          <p className="font-medium">Delivery Address:</p>
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
                        </div>
                      ) : (
                        <p>No shipping address provided</p>
                      )}
                    </div>
                  </div>
                </div>

                <h4 className="text-lg font-medium text-gray-900 mb-4">Order Items</h4>
                <div className="bg-neutral/5 rounded-[12px] overflow-hidden mb-8">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-200">
                      <thead className="bg-neutral/10">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Item</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Price</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Quantity</th>
                          <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200">
                        {selectedOrder.items && selectedOrder.items.map((item, index) => (
                          <tr key={index} className="hover:bg-neutral/5">
                            <td className="px-6 py-4">
                              <motion.div 
                                className="flex items-center gap-4 cursor-pointer"
                                onClick={() => navigate(`/product/${item.jewelry._id}`)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                {item.jewelry && typeof item.jewelry === 'object' && item.jewelry.imageUrl && (
                                  <div className="h-16 w-16 flex-shrink-0">
                                    <img 
                                      className="h-16 w-16 object-cover rounded-[8px]" 
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
                                  <p className="font-medium text-gray-900 hover:text-primary transition-colors">
                                    {item.jewelry && typeof item.jewelry === 'object' ? item.jewelry.name : 'Unknown Product'}
                                  </p>
                                  {item.jewelry && typeof item.jewelry === 'object' && item.jewelry.categories && (
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {item.jewelry.categories.map((category, idx) => (
                                        <span 
                                          key={idx}
                                          className="px-2 py-0.5 text-xs bg-neutral/10 text-gray-600 rounded-[4px]"
                                        >
                                          {category}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            </td>
                            <td className="px-6 py-4">
                              ₹{((item.jewelry?.sellingPrice || item.jewelry?.price || 0)).toLocaleString('en-IN')}
                            </td>
                            <td className="px-6 py-4">{item.quantity}</td>
                            <td className="px-6 py-4">
                              ₹{((item.jewelry?.sellingPrice || item.jewelry?.price || 0) * item.quantity).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-neutral/10">
                        <tr>
                          <td colSpan="3" className="px-6 py-4 text-right font-medium">Items Total:</td>
                          <td className="px-6 py-4 font-medium">
                            ₹{selectedOrder.items.reduce((total, item) => 
                              total + ((item.jewelry?.sellingPrice || item.jewelry?.price || 0) * item.quantity), 0).toLocaleString('en-IN')}
                          </td>
                        </tr>
                        {selectedOrder.items.reduce((total, item) => 
                          total + ((item.jewelry?.sellingPrice || item.jewelry?.price || 0) * item.quantity), 0) > selectedOrder.totalAmount && (
                          <tr>
                            <td colSpan="3" className="px-6 py-4 text-right font-medium text-green-600">Coupon Discount:</td>
                            <td className="px-6 py-4 font-medium text-green-600">
                              -₹{(selectedOrder.items.reduce((total, item) => 
                                total + ((item.jewelry?.sellingPrice || item.jewelry?.price || 0) * item.quantity), 0) - selectedOrder.totalAmount).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td colSpan="3" className="px-6 py-4 text-right font-medium">Final Total:</td>
                          <td className="px-6 py-4 font-medium">
                            ₹{selectedOrder.totalAmount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {selectedOrder && (
                  <div className="mt-8">
                    {renderRequestStatus(selectedOrder._id) || (
                      <div className="flex gap-4">
                        <motion.button
                          onClick={() => {
                            setSelectedOrderForRequest(selectedOrder);
                            setRequestType('replacement');
                            setShowRequestModal(true);
                          }}
                          className="px-6 py-3 bg-primary text-white rounded-[12px] hover:bg-primary/90 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Request Replacement
                        </motion.button>
                        <motion.button
                          onClick={() => {
                            setSelectedOrderForRequest(selectedOrder);
                            setRequestType('refund');
                            setShowRequestModal(true);
                          }}
                          className="px-6 py-3 bg-red-500 text-white rounded-[12px] hover:bg-red-600 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Request Refund
                        </motion.button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      )}
      
      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <motion.div 
            className="bg-white rounded-[16px] p-8 w-full max-w-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <h3 className="text-2xl font-cinzel-decorative text-secondary mb-6">Submit Request</h3>
            <form onSubmit={handleRequestSubmit}>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium">Reason</label>
                <textarea
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-[8px] focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  rows="4"
                  required
                />
              </div>
              
              {/* Combined Image and Video Upload Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Image Upload Section */}
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Upload Images (up to 5)</label>
                  <div className="space-y-4">
                    {requestImagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {requestImagePreviews.map((preview, index) => (
                          <div key={index} className="relative w-full h-32 rounded-[8px] overflow-hidden">
                            <img
                              src={preview}
                              alt={`Request preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setRequestImages(prev => prev.filter((_, i) => i !== index));
                                setRequestImagePreviews(prev => prev.filter((_, i) => i !== index));
                              }}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-[4px] hover:bg-red-600 transition-colors"
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-3 pb-4">
                          <FiUpload className="w-6 h-6 mb-2 text-gray-500" />
                          <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          multiple
                          accept="image/*"
                          onChange={(e) => {
                            const files = Array.from(e.target.files);
                            if (files.length + requestImages.length > 5) {
                              setToastMessage('You can only upload up to 5 images');
                              setToastType('error');
                              setShowToast(true);
                              return;
                            }
                            setRequestImages(prev => [...prev, ...files]);
                            files.forEach(file => {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setRequestImagePreviews(prev => [...prev, reader.result]);
                              };
                              reader.readAsDataURL(file);
                            });
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Video Upload Section */}
                <div>
                  <label className="block text-gray-700 mb-2 font-medium">Upload Videos (optional, up to 2)</label>
                  <div className="space-y-4">
                    {requestVideoPreviews.length > 0 && (
                      <div className="grid grid-cols-1 gap-2">
                        {requestVideoPreviews.map((preview, index) => (
                          <div key={index} className="relative w-full h-32 rounded-[8px] overflow-hidden">
                            <video
                              src={preview.url}
                              controls
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setRequestVideos(prev => prev.filter((_, i) => i !== index));
                                setRequestVideoPreviews(prev => prev.filter((_, i) => i !== index));
                              }}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-[4px] hover:bg-red-600 transition-colors"
                            >
                              <FiX size={16} />
                            </button>
                            <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1 py-0.5 rounded">
                              {preview.size}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-3 pb-4">
                          <FiUpload className="w-6 h-6 mb-2 text-gray-500" />
                          <p className="text-xs text-gray-500">MP4, MOV, AVI or WEBM (MAX. 2)</p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          multiple
                          accept="video/*"
                          onChange={handleVideoFileChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-4">
                <motion.button
                  type="button"
                  onClick={() => {
                    setShowRequestModal(false);
                    setRequestType('');
                    setRequestReason('');
                    setRequestImages([]);
                    setRequestImagePreviews([]);
                    setRequestVideos([]);
                    setRequestVideoPreviews([]);
                  }}
                  className="px-4 py-2 bg-neutral text-gray-700 rounded-[8px] hover:bg-neutral/80 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={loading || !requestType || !requestReason || requestImages.length === 0}
                  className={`px-4 py-2 bg-primary text-white rounded-[8px] ${
                    loading || !requestType || !requestReason || requestImages.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'
                  } transition-colors`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      
      {/* Request Status Modal */}
      {showRequestStatusModal && selectedOrderForRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
          <motion.div 
            className="bg-white rounded-[16px] p-8 w-full max-w-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <h3 className="text-2xl font-cinzel-decorative text-secondary mb-6">Request Status</h3>
            <div className="space-y-6">
              <div className="bg-neutral/5 rounded-[12px] p-6">
                <p className="font-medium text-lg mb-2">Type: {selectedOrderForRequest.type}</p>
                <p className="mb-4">Status: {selectedOrderForRequest.status}</p>
                <p className="mb-4">Reason: {selectedOrderForRequest.reason}</p>
                {selectedOrderForRequest.adminResponse && (
                  <p className="text-gray-600 mb-4">Admin Response: {selectedOrderForRequest.adminResponse}</p>
                )}
                
                {/* Display uploaded images */}
                {selectedOrderForRequest.imageUrls && selectedOrderForRequest.imageUrls.length > 0 && (
                  <div className="mb-4">
                    <p className="font-medium mb-2">Uploaded Images:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedOrderForRequest.imageUrls.map((url, index) => (
                        <div key={index} className="relative w-full h-40 rounded-[8px] overflow-hidden">
                          <img
                            src={url}
                            alt={`Request image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Display uploaded videos */}
                {selectedOrderForRequest.videoUrls && selectedOrderForRequest.videoUrls.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">Uploaded Videos:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedOrderForRequest.videoUrls.map((url, index) => (
                        <div key={index} className="relative w-full h-48 rounded-[8px] overflow-hidden">
                          <video
                            src={url}
                            controls
                            className="w-full h-full object-cover"
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end">
                <motion.button
                  onClick={() => {
                    setShowRequestStatusModal(false);
                    setSelectedOrderForRequest(null);
                  }}
                  className="px-6 py-3 bg-neutral text-gray-700 rounded-[12px] hover:bg-neutral/80 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
              </div>
            </div>
          </motion.div>
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