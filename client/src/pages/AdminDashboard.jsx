import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp, FiPlusCircle, FiX, FiEdit, FiTrash2, FiUpload, FiImage, FiUser, FiUserX, FiUserCheck, FiCheck, FiLoader } from 'react-icons/fi';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import Toast from '../components/Toast';
import Navbar from '../components/Navbar';
import LoadingScreen from '../components/LoadingScreen';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const API_BASE_URL = 'http://localhost:5001/api';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);
  const fileInputRef = useRef(null);

  // Dashboard stats state
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    salesData: [],
    topProducts: []
  });

  // Form state for adding/editing products
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: 0,
    sellingPrice: '',
    categories: ['necklace'],
    tags: ['new arrival'],
    imageUrls: [], // Changed from imageUrl to imageUrls array
    stock: 1,
    detailedDescription: '',
    rating: 0,
    isAvailable: true
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [customTag, setCustomTag] = useState('');

  // Chart options
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sales Overview (Last 30 Days)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top Selling Products',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  // Add a new state for initial loading
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Fetch dashboard stats when the component mounts or dashboard tab is active
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardStats();
    }
  }, [activeTab]);

  // Fetch products when the component mounts or products tab is clicked
  useEffect(() => {
    if (activeTab === 'products' || activeTab === 'add-product') {
      fetchProducts();
    }
  }, [activeTab]);

  // Admin check
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      setToastMessage('Access denied. Admin privileges required.');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } else {
      setIsInitialLoading(false);
    }
  }, [currentUser, navigate]);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/dashboard/stats`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      setDashboardStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setToastMessage('Failed to fetch dashboard statistics');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products from the API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/jewelry`);
      // The API returns an object with a products array
      setProducts(Array.isArray(response.data.products) ? response.data.products : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setToastMessage('Failed to fetch products');
      setToastType('error');
      setShowToast(true);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    
    // Calculate selling price when price or discount changes
    if (name === 'price' || name === 'discount') {
      const price = name === 'price' ? parseFloat(value) || 0 : parseFloat(formData.price) || 0;
      const discount = name === 'discount' ? parseFloat(value) || 0 : parseFloat(formData.discount) || 0;
      const sellingPrice = price - discount;
      
      setFormData(prev => ({
        ...prev,
        [name]: newValue,
        sellingPrice: sellingPrice.toFixed(2)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }));
    }
    
    // Clear error for this field when user changes it
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Handle file input change for image upload
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Create previews of the selected images
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Upload images to server
  const handleImageUpload = async (e) => {
    e.preventDefault();
    const fileInput = fileInputRef.current;
    
    if (!fileInput.files || fileInput.files.length === 0) {
      setToastMessage('Please select images to upload');
      setToastType('error');
      setShowToast(true);
      return;
    }
    
    const files = Array.from(fileInput.files);
    
    // Validate file types
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setToastMessage('Please select valid image files');
      setToastType('error');
      setShowToast(true);
      return;
    }
    
    try {
      setUploadingImage(true);
      
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      
      const response = await axios.post(
        `${API_BASE_URL}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      
      // Update form data with the Cloudinary URLs
      setFormData(prev => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...response.data.filePaths]
      }));
      
      setToastMessage('Images uploaded successfully');
      setToastType('success');
      setShowToast(true);
      
      // Clear the file input and preview
      fileInput.value = '';
      setImagePreview([]);
      
    } catch (error) {
      console.error('Error uploading images:', error);
      setToastMessage(error.response?.data?.message || 'Failed to upload images');
      setToastType('error');
      setShowToast(true);
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove an image
  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.price || formData.price <= 0) errors.price = 'Price must be greater than 0';
    if (formData.discount < 0 || formData.discount >= formData.price) errors.discount = 'Discount must be less than price';
    if (formData.imageUrls.length === 0) errors.imageUrls = 'At least one image is required';
    if (formData.stock < 0) errors.stock = 'Stock cannot be negative';
    return errors;
  };

  // Submit form to add or update a product
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      // Format the data for API
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        rating: parseFloat(formData.rating)
      };
      
      // Get the token from localStorage or from context
      const token = localStorage.getItem('token');
      
      if (!token) {
        setToastMessage('Authentication error. Please log in again.');
        setToastType('error');
        setShowToast(true);
        setLoading(false);
        return;
      }
      
      let response;
      
      if (isEditing) {
        // Update existing product
        response = await axios.put(
          `${API_BASE_URL}/jewelry/${editingId}`, 
          productData,
          { 
            headers: { 
              'x-auth-token': token,
              'Content-Type': 'application/json'
            } 
          }
        );
        setToastMessage('Product updated successfully');
        setToastType('success');
      } else {
        // Add new product
        response = await axios.post(
          `${API_BASE_URL}/jewelry`, 
          productData,
          { 
            headers: { 
              'x-auth-token': token,
              'Content-Type': 'application/json'
            } 
          }
        );
        setToastMessage('Product added successfully');
        setToastType('success');
      }
      
      setShowToast(true);
      
      // Reset form and refresh product list
      resetForm();
      setActiveTab('products');
      fetchProducts();
      
    } catch (error) {
      console.error('Error saving product:', error);
      let errorMessage = 'Failed to save product';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 403) {
          errorMessage = 'You do not have permission to add products. Admin privileges required.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please try again later.';
      }
      
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Edit a product
  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      categories: product.categories || ['necklace'],
      tags: product.tags || ['new arrival'],
      imageUrls: product.imageUrls || [],
      stock: product.stock,
      detailedDescription: product.detailedDescription || '',
      rating: product.rating || 0,
      isAvailable: product.isAvailable !== false
    });
    
    setIsEditing(true);
    setEditingId(product._id);
    setActiveTab('add-product');
  };

  // Delete a product
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      setLoading(true);
      await axios.delete(
        `${API_BASE_URL}/jewelry/${id}`,
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      
      setToastMessage('Product deleted successfully');
      setToastType('success');
      setShowToast(true);
      
      // Refresh product list
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      setToastMessage(error.response?.data?.message || 'Failed to delete product');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Reset form data and state
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      categories: ['necklace'],
      tags: ['new arrival'],
      imageUrls: [],
      stock: 1,
      detailedDescription: '',
      rating: 0,
      isAvailable: true
    });
    setNewCategory('');
    setNewTag('');
    setFormErrors({});
    setIsEditing(false);
    setEditingId(null);
  };

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userAction, setUserAction] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [banExpiry, setBanExpiry] = useState('');

  // Fetch users when users tab is active
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/dashboard/users`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setToastMessage('Failed to fetch users');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user details and orders
  const fetchUserDetails = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/dashboard/users/${userId}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      setSelectedUser(response.data.user);
      setUserOrders(response.data.orders);
      setShowUserModal(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setToastMessage('Failed to fetch user details');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle user status update
  const handleUserStatusUpdate = async () => {
    try {
      setLoading(true);
      await axios.put(
        `${API_BASE_URL}/dashboard/users/${selectedUser._id}/status`,
        {
          status: userAction,
          banReason: userAction !== 'active' ? banReason : '',
          banExpiry: userAction !== 'active' ? banExpiry : null
        },
        {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );

      setToastMessage(`User ${userAction} successfully`);
      setToastType('success');
      setShowToast(true);
      setShowUserModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      setToastMessage('Failed to update user status');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle user deletion
  const handleUserDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/dashboard/users/${userId}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });

      setToastMessage('User deleted successfully');
      setToastType('success');
      setShowToast(true);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      setToastMessage('Failed to delete user');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const [orderRequests, setOrderRequests] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchOrderRequests = async () => {
    try {
      setLoadingOrders(true);
      const response = await axios.get(`${API_BASE_URL}/order/admin`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      setOrderRequests(response.data.orderRequests);
    } catch (error) {
      console.error('Error fetching order requests:', error);
      setToastMessage('Failed to fetch order requests');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleOrderStatusUpdate = async (orderId, status) => {
    try {
      await axios.put(
        `${API_BASE_URL}/order/${orderId}/status`,
        { status },
        {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      setToastMessage(`Order request ${status} successfully`);
      setToastType('success');
      setShowToast(true);
      
      // Refresh both order lists to ensure UI is updated
      fetchOrderRequests();
      fetchAllOrders();
      
      // If we're updating from the modal, refresh the selected order details
      if (selectedOrder && selectedOrder._id === orderId) {
        fetchOrderDetails(orderId);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setToastMessage('Failed to update order status');
      setToastType('error');
      setShowToast(true);
    }
  };

  useEffect(() => {
    fetchOrderRequests();
  }, []);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchAllOrders();
    }
  }, [activeTab]);

  // State for orders management
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);

  // Fetch all orders
  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/order/admin`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      setOrderRequests(response.data.orderRequests);
      setOrders(response.data.allOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setToastMessage('Failed to fetch orders');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch order details
  const fetchOrderDetails = async (orderId) => {
    try {
      setLoadingOrderDetails(true);
      const response = await axios.get(`${API_BASE_URL}/order/${orderId}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
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

  const handleAddCategory = () => {
    // For regular dropdown selection
    if (newCategory && newCategory !== 'custom' && !formData.categories.includes(newCategory.trim())) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()]
      }));
      setNewCategory('');
    } 
    // For custom input
    else if (newCategory === 'custom' && customCategory.trim() && !formData.categories.includes(customCategory.trim())) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, customCategory.trim()]
      }));
      setCustomCategory('');
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (categoryToRemove) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(category => category !== categoryToRemove)
    }));
  };

  const handleAddTag = () => {
    // For regular dropdown selection
    if (newTag && newTag !== 'custom' && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
    // For custom input
    else if (newTag === 'custom' && customTag.trim() && !formData.tags.includes(customTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, customTag.trim()]
      }));
      setCustomTag('');
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await axios.get(`${API_BASE_URL}/request/admin`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setToastMessage('Failed to fetch requests');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleRequestStatusUpdate = async (requestId, status) => {
    try {
      await axios.put(
        `${API_BASE_URL}/request/${requestId}/status`,
        { status, adminResponse },
        {
          headers: {
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );

      setToastMessage(`Request ${status} successfully`);
      setToastType('success');
      setShowToast(true);
      setShowRequestModal(false);
      setAdminResponse('');
      fetchRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      setToastMessage('Failed to update request status');
      setToastType('error');
      setShowToast(true);
    }
  };

  // Add this useEffect to fetch requests when the requests tab is active
  useEffect(() => {
    if (activeTab === 'requests') {
      fetchRequests();
    }
  }, [activeTab]);

  const handleRequestDelete = async (requestId) => {
    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/request/${requestId}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      setToastMessage('Request deleted successfully');
      setToastType('success');
      setShowToast(true);
      fetchRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      setToastMessage('Failed to delete request');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAction = async (orderId, action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/order/${orderId}/status`,
        { status: action },
        { headers: { 'x-auth-token': token } }
      );

      // Update the order in the state
      setOrders(orders.map(order => 
        order._id === orderId ? response.data : order
      ));

      setToastMessage(`Order ${action} successfully`);
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      console.error('Error updating order status:', error);
      setToastMessage(error.response?.data?.message || 'Failed to update order status');
      setToastType('error');
      setShowToast(true);
    }
  };

  if (isInitialLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'dashboard'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'products'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setActiveTab('products')}
            >
              Products
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'orders'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'users'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setActiveTab('users')}
            >
              Users
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'requests'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setActiveTab('requests')}
            >
              Requests
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {loading ? <LoadingScreen fullScreen={false} /> : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-2xl font-semibold text-gray-900">{dashboardStats.totalUsers}</p>
                        <p className="text-sm text-green-600 mt-1">+12% from last month</p>
                      </div>
                      <div className="p-3 bg-purple-100 rounded-full">
                        <FiUsers className="text-purple-600" size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Orders</p>
                        <p className="text-2xl font-semibold text-gray-900">{dashboardStats.totalOrders}</p>
                        <p className="text-sm text-green-600 mt-1">+8% from last month</p>
                      </div>
                      <div className="p-3 bg-green-100 rounded-full">
                        <FiShoppingBag className="text-green-600" size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-semibold text-gray-900">${dashboardStats.totalRevenue.toFixed(2)}</p>
                        <p className="text-sm text-green-600 mt-1">+15% from last month</p>
                      </div>
                      <div className="p-3 bg-blue-100 rounded-full">
                        <FiDollarSign className="text-blue-600" size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Growth</p>
                        <p className="text-2xl font-semibold text-gray-900">23%</p>
                        <p className="text-sm text-green-600 mt-1">+5% from last month</p>
                      </div>
                      <div className="p-3 bg-yellow-100 rounded-full">
                        <FiTrendingUp className="text-yellow-600" size={24} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <Line
                      data={{
                        labels: dashboardStats.salesData.map(item => item._id),
                        datasets: [
                          {
                            label: 'Daily Sales',
                            data: dashboardStats.salesData.map(item => item.total),
                            borderColor: 'rgb(99, 102, 241)',
                            backgroundColor: 'rgba(99, 102, 241, 0.5)',
                            tension: 0.4,
                          },
                        ],
                      }}
                      options={lineChartOptions}
                    />
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <Bar
                      data={{
                        labels: dashboardStats.topProducts.map(item => item?._id?.name || 'Unknown Product'),
                        datasets: [
                          {
                            label: 'Units Sold',
                            data: dashboardStats.topProducts.map(item => item?.totalSold || 0),
                            backgroundColor: 'rgba(16, 185, 129, 0.5)',
                            borderColor: 'rgb(16, 185, 129)',
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={barChartOptions}
                    />
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dashboardStats.recentOrders.map((order) => (
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order._id.slice(-6)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.user.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${order.totalAmount.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Order Requests</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loadingOrders ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-4 text-center">
                              <div className="flex justify-center">
                                <div className="animate-spin text-gray-500 mr-2">
                                  <FiLoader size={20} />
                                </div>
                                <p>Loading orders...</p>
                              </div>
                            </td>
                          </tr>
                        ) : orderRequests.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                              No order requests found
                            </td>
                          </tr>
                        ) : (
                          orderRequests.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {order._id.slice(-6)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {order.user.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ₹{order.totalAmount.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  order.requestStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                  order.requestStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {order.requestStatus}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex space-x-2">
                                  <button 
                                    className="text-indigo-600 hover:text-indigo-900"
                                    onClick={() => fetchOrderDetails(order._id)}
                                  >
                                    View Details
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Manage Products</h2>
              <button 
                className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center"
                onClick={() => {
                  resetForm();
                  setActiveTab('add-product');
                }}
              >
                <FiPlusCircle className="mr-2" />
                Add New
              </button>
            </div>
            <div className="p-6">
              {loading ? <LoadingScreen fullScreen={false} /> : (
                <>
                  {loading ? (
                    <div className="flex justify-center items-center h-48">
                      <div className="spinner-border text-purple-500" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>
                  ) : !products || products.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No products found</p>
                      <button 
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
                        onClick={() => setActiveTab('add-product')}
                      >
                        Add Your First Product
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {products.map(product => (
                            <tr key={product._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <img 
                                  src={product.imageUrls[0]} 
                                  alt={product.name} 
                                  className="h-16 w-16 object-cover rounded-md"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                <div className="text-sm text-gray-500">{product.description}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ₹{(product.price || 0).toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ₹{(product.discount || 0).toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ₹{(product.sellingPrice || 0).toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {product.stock}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-3">
                                  <button 
                                    onClick={() => handleEdit(product)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                  >
                                    <FiEdit size={18} />
                                  </button>
                                  <button 
                                    onClick={() => handleDelete(product._id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <FiTrash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'add-product' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </h2>
              {isEditing && (
                <button 
                  className="text-gray-500 hover:text-gray-700"
                  onClick={resetForm}
                >
                  <FiX size={20} />
                </button>
              )}
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name*
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md bg-white ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter product name"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categories*
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.categories.map((category, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                        >
                          {category}
                          <button
                            type="button"
                            onClick={() => handleRemoveCategory(category)}
                            className="ml-2 text-purple-600 hover:text-purple-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <select 
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-md bg-white"
                      >
                        <option value="">Select a category</option>
                        {['necklace', 'earrings', 'bracelet', 'ring', 'pendant', 'set'].map(cat => (
                          <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                        ))}
                        <option value="custom">+ Add custom category</option>
                      </select>
                      {newCategory === 'custom' ? (
                        <div className="flex flex-1 gap-2">
                          <input
                            type="text"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded-md bg-white"
                            placeholder="Enter custom category"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCategory();
                              }
                            }}
                          />
                        </div>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        disabled={(newCategory === 'custom' && !customCategory.trim()) || !newCategory}
                      >
                        Add
                      </button>
                    </div>
                    {formErrors.categories && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.categories}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags*
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <select 
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-md bg-white"
                      >
                        <option value="">Select a tag</option>
                        {['new arrival', 'trending', 'best seller', 'sale', 'limited edition', 'premium', 'handcrafted'].map(tag => (
                          <option key={tag} value={tag}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</option>
                        ))}
                        <option value="custom">+ Add custom tag</option>
                      </select>
                      {newTag === 'custom' ? (
                        <div className="flex flex-1 gap-2">
                          <input
                            type="text"
                            value={customTag}
                            onChange={(e) => setCustomTag(e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded-md bg-white"
                            placeholder="Enter custom tag"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTag();
                              }
                            }}
                          />
                        </div>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        disabled={(newTag === 'custom' && !customTag.trim()) || !newTag}
                      >
                        Add
                      </button>
                    </div>
                    {formErrors.tags && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.tags}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($)*
                    </label>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md bg-white ${formErrors.price ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter price"
                    />
                    {formErrors.price && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.price}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount ($)
                    </label>
                    <input
                      type="number"
                      name="discount"
                      step="0.01"
                      min="0"
                      value={formData.discount}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md bg-white ${formErrors.discount ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter discount amount"
                    />
                    {formErrors.discount && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.discount}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock*
                    </label>
                    <input
                      type="number"
                      name="stock"
                      min="0"
                      value={formData.stock}
                      onChange={handleInputChange}
                      className={`w-full p-2 border rounded-md bg-white ${formErrors.stock ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter available stock"
                    />
                    {formErrors.stock && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.stock}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Images*
                    </label>
                    <div className={`border rounded-md p-3 ${formErrors.imageUrls ? 'border-red-500' : 'border-gray-300'}`}>
                      {/* Image previews */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        {formData.imageUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={url} 
                              alt={`Product preview ${index + 1}`} 
                              className="h-40 w-full object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        ))}
                        {imagePreview.map((preview, index) => (
                          <div key={`preview-${index}`} className="relative">
                            <img 
                              src={preview} 
                              alt={`Preview ${index + 1}`} 
                              className="h-40 w-full object-cover rounded-md"
                            />
                          </div>
                        ))}
                      </div>
                      
                      {/* File input */}
                      <div className="flex items-center justify-center">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleFileChange}
                          multiple
                          className="hidden"
                          id="product-images"
                        />
                        <label 
                          htmlFor="product-images" 
                          className="cursor-pointer flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                          <FiImage className="mr-2" />
                          Select Images
                        </label>
                        
                        {imagePreview.length > 0 && (
                          <button
                            onClick={handleImageUpload}
                            disabled={uploadingImage}
                            className="ml-3 flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                          >
                            <FiUpload className="mr-2" />
                            {uploadingImage ? 'Uploading...' : 'Upload'}
                          </button>
                        )}
                      </div>
                      
                      {formData.imageUrls.length > 0 && (
                        <p className="mt-2 text-sm text-green-600">
                          {formData.imageUrls.length} image(s) uploaded successfully
                        </p>
                      )}
                    </div>
                    {formErrors.imageUrls && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.imageUrls}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Initial Rating (0-5)
                    </label>
                    <input
                      type="number"
                      name="rating"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md bg-white"
                      placeholder="Enter initial rating"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Short Description*
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className={`w-full p-2 border rounded-md bg-white ${formErrors.description ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter a short product description"
                    ></textarea>
                    {formErrors.description && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Detailed Description*
                    </label>
                    <textarea
                      name="detailedDescription"
                      value={formData.detailedDescription}
                      onChange={handleInputChange}
                      rows="5"
                      className={`w-full p-2 border rounded-md bg-white ${formErrors.detailedDescription ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter detailed product information including materials, dimensions, etc."
                    ></textarea>
                    {formErrors.detailedDescription && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.detailedDescription}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isAvailable"
                        name="isAvailable"
                        checked={formData.isAvailable}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">
                        Product is available for sale
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab('products');
                    }}
                    className="mr-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">User Management</h2>
            </div>
            <div className="p-6">
              {loading ? <LoadingScreen fullScreen={false} /> : (
                <>
                  {loading ? (
                    <div className="flex justify-center items-center h-48">
                      <div className="spinner-border text-purple-500" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No users found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Orders
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((user) => (
                            <tr key={user._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                                      <FiUser className="text-gray-500" />
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {user.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  user.status === 'active' ? 'bg-green-100 text-green-800' :
                                  user.status === 'banned' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {user.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {user.orderCount || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                                  onClick={() => fetchUserDetails(user._id)}
                                >
                                  <FiEdit />
                                </button>
                                <button
                                  className="text-red-600 hover:text-red-900"
                                  onClick={() => handleUserDelete(user._id)}
                                >
                                  <FiTrash2 />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-8">
            {loading ? <LoadingScreen fullScreen={false} /> : (
              <>
                {/* Order Requests Section */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Order Requests</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loadingOrders ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-4 text-center">
                              <div className="flex justify-center">
                                <div className="animate-spin text-gray-500 mr-2">
                                  <FiLoader size={20} />
                                </div>
                                <p>Loading orders...</p>
                              </div>
                            </td>
                          </tr>
                        ) : orderRequests.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                              No order requests found
                            </td>
                          </tr>
                        ) : (
                          orderRequests.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {order._id.slice(-6)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {order.user.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ₹{order.totalAmount.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  order.requestStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                  order.requestStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {order.requestStatus}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex space-x-2">
                                  <button 
                                    className="text-indigo-600 hover:text-indigo-900"
                                    onClick={() => fetchOrderDetails(order._id)}
                                  >
                                    View Details
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* All Orders Section */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">All Orders</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-4 text-center">
                              <div className="flex justify-center">
                                <div className="animate-spin text-gray-500 mr-2">
                                  <FiLoader size={20} />
                                </div>
                                <p>Loading orders...</p>
                              </div>
                            </td>
                          </tr>
                        ) : orders.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                              No orders found
                            </td>
                          </tr>
                        ) : (
                          orders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {order._id.slice(-6)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {order.user.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                ₹{order.totalAmount.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  order.requestStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                  order.requestStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {order.requestStatus}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex space-x-2">
                                  <button 
                                    className="text-indigo-600 hover:text-indigo-900"
                                    onClick={() => fetchOrderDetails(order._id)}
                                  >
                                    View Details
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Replacement/Refund Requests</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loadingRequests ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin text-gray-500 mr-2">
                            <FiLoader size={20} />
                          </div>
                          <p>Loading requests...</p>
                        </div>
                      </td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        No requests found
                      </td>
                    </tr>
                  ) : (
                    requests.map((request) => (
                      <tr 
                        key={request._id} 
                        className={`hover:bg-gray-50 ${request.deleted ? 'opacity-50' : ''}`}
                      >
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${request.deleted ? 'line-through' : ''}`}>
                          {request._id.slice(-6)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${request.deleted ? 'line-through' : ''}`}>
                          {request.user.name}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${request.deleted ? 'line-through' : ''}`}>
                          {request.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            request.status === 'deleted' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {request.status}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${request.deleted ? 'line-through' : ''}`}>
                          {new Date(request.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowRequestModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              View Details
                            </button>
                            {!request.deleted && (request.status === 'approved' || request.status === 'rejected') && (
                              <button
                                onClick={() => handleRequestDelete(request._id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
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
                    <h4 className="font-medium text-gray-700 mb-2">Order Information</h4>
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
                      <p><span className="font-medium">Total Amount:</span> ${selectedOrder.totalAmount.toFixed(2)}</p>
                      {selectedOrder.paymentMethod && (
                        <p><span className="font-medium">Payment Method:</span> {selectedOrder.paymentMethod}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Customer Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {selectedOrder.user && typeof selectedOrder.user === 'object' ? (
                        <>
                          <p><span className="font-medium">Name:</span> {selectedOrder.user.name}</p>
                          <p><span className="font-medium">Email:</span> {selectedOrder.user.email}</p>
                          <p><span className="font-medium">Phone:</span> {selectedOrder.user.phone || 'Not provided'}</p>
                          <p><span className="font-medium">WhatsApp:</span> {selectedOrder.whatsappPhone || 'Not provided'}</p>

                          {selectedOrder.shippingAddress && (
                            <>
                              <p className="font-medium mt-2">Shipping Address:</p>
                              <p>{selectedOrder.shippingAddress.street || selectedOrder.shippingAddress.address}</p>
                              <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                              <p>{selectedOrder.shippingAddress.country}</p>
                            </>
                          )}
                        </>
                      ) : (
                        <p>User information not available</p>
                      )}
                    </div>

                    {selectedOrder.whatsappMessage && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-700 mb-2">WhatsApp Message</h4>
                        <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap">
                          {selectedOrder.whatsappMessage}
                        </div>
                      </div>
                    )}
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
                                    src={item.jewelry.imageUrl} 
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
                            ${item.price ? item.price.toFixed(2) : '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            ${(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100">
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-right font-medium">Total:</td>
                        <td className="px-6 py-4 font-medium">${selectedOrder.totalAmount.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {selectedOrder.notes && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-2">Order Notes</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p>{selectedOrder.notes}</p>
                    </div>
                  </div>
                )}

                {selectedOrder.requestStatus === 'pending' && (
                  <div className="flex space-x-4 justify-end mt-4">
                    <button 
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      onClick={() => {
                        handleOrderStatusUpdate(selectedOrder._id, 'rejected');
                        setShowOrderModal(false);
                      }}
                    >
                      Reject Order
                    </button>
                    <button 
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      onClick={() => {
                        handleOrderStatusUpdate(selectedOrder._id, 'approved');
                        setShowOrderModal(false);
                      }}
                    >
                      Approve Order
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      {/* Request Details Modal */}
      {showRequestModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-medium mb-4">Request Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Request Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p><span className="font-medium">Request ID:</span> {selectedRequest._id}</p>
                  <p><span className="font-medium">Type:</span> {selectedRequest.type}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedRequest.status === 'approved' ? 'bg-green-100 text-green-800' :
                      selectedRequest.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedRequest.status}
                    </span>
                  </p>
                  <p><span className="font-medium">Date:</span> {new Date(selectedRequest.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Customer Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p><span className="font-medium">Name:</span> {selectedRequest.user.name}</p>
                  <p><span className="font-medium">Email:</span> {selectedRequest.user.email}</p>
                </div>
              </div>
            </div>
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-2">Reason</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p>{selectedRequest.reason}</p>
              </div>
            </div>
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-2">Image</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <img src={selectedRequest.imageUrl} alt="Request" className="max-w-full h-auto" />
              </div>
            </div>
            {selectedRequest.status === 'pending' && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Admin Response</label>
                  <textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows="4"
                    placeholder="Enter your response here..."
                  />
                </div>
                <div className="flex space-x-4 justify-end">
                  <button
                    onClick={() => {
                      handleRequestStatusUpdate(selectedRequest._id, 'rejected');
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reject Request
                  </button>
                  <button
                    onClick={() => {
                      handleRequestStatusUpdate(selectedRequest._id, 'approved');
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approve Request
                  </button>
                </div>
              </>
            )}
            {selectedRequest.status !== 'pending' && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Admin Response</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p>{selectedRequest.adminResponse}</p>
                </div>
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setSelectedRequest(null);
                  setAdminResponse('');
                }}
                className="px-4 py-2 border rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* User Management Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-medium mb-4">User Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">User Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p><span className="font-medium">Name:</span> {selectedUser.name}</p>
                  <p><span className="font-medium">Email:</span> {selectedUser.email}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedUser.status === 'active' ? 'bg-green-100 text-green-800' :
                      selectedUser.status === 'banned' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedUser.status}
                    </span>
                  </p>
                  {selectedUser.status !== 'active' && (
                    <>
                      <p><span className="font-medium">Ban Reason:</span> {selectedUser.banReason}</p>
                      {selectedUser.banExpiry && (
                        <p><span className="font-medium">Ban Expiry:</span> {new Date(selectedUser.banExpiry).toLocaleString()}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Order History</h4>
                <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                  {userOrders.length === 0 ? (
                    <p className="text-gray-500">No orders found</p>
                  ) : (
                    <ul className="space-y-2">
                      {userOrders.map(order => (
                        <li key={order._id} className="border-b pb-2">
                          <p className="font-medium">Order #{order._id.slice(-6)}</p>
                          <p className="text-sm text-gray-600">Amount: ₹{order.totalAmount.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">Status: {order.requestStatus}</p>
                          <p className="text-sm text-gray-600">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            {selectedUser.status === 'active' ? (
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Ban Reason</label>
                <input
                  type="text"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Enter ban reason"
                />
                <label className="block text-gray-700 mb-2 mt-4">Ban Expiry (Optional)</label>
                <input
                  type="datetime-local"
                  value={banExpiry}
                  onChange={(e) => setBanExpiry(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            ) : null}
            <div className="flex space-x-4 justify-end">
              {selectedUser.status === 'active' ? (
                <>
                  <button
                    onClick={() => {
                      setUserAction('suspended');
                      handleUserStatusUpdate();
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    Suspend User
                  </button>
                  <button
                    onClick={() => {
                      setUserAction('banned');
                      handleUserStatusUpdate();
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Ban User
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setUserAction('active');
                    handleUserStatusUpdate();
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Activate User
                </button>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                  setBanReason('');
                  setBanExpiry('');
                }}
                className="px-4 py-2 border rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;