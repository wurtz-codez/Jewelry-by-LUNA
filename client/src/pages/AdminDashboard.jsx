import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp, FiPlusCircle, FiX, FiEdit, FiTrash2, FiUpload, FiImage, FiUser, FiUserX, FiUserCheck, FiCheck, FiLoader, FiVideo } from 'react-icons/fi';
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
import { motion } from 'framer-motion';

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

// Use localhost for development, production URL for production
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5001/api' 
  : 'https://jewelry-by-luna.onrender.com/api';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);
  const [videoPreview, setVideoPreview] = useState([]);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);

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
    discount: '0',
    sellingPrice: '0',
    categories: ['necklace'],
    tags: ['new arrival'],
    imageUrls: [],
    videoUrls: [],
    stock: 1,
    detailedDescription: '',
    rating: 0,
    isAvailable: true
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [newCategory, setNewCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [newTag, setNewTag] = useState('');
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
      setDashboardLoading(true);
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
      setDashboardLoading(false);
    }
  };

  // Fetch products from the API
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
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
      setProductsLoading(false);
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
      setImageUploading(true);
      
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      
      const token = localStorage.getItem('token');
      if (!token) {
        setToastMessage('Authentication required. Please log in again.');
        setToastType('error');
        setShowToast(true);
        setImageUploading(false);
        return;
      }
      
      const response = await axios.post(
        `${API_BASE_URL}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': token
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
      let errorMessage = 'Failed to upload images';
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        console.error('Error request:', error.request);
        errorMessage = 'No response from server. Check your network connection.';
      } else {
        console.error('Error message:', error.message);
        errorMessage = error.message;
      }
      
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
    } finally {
      setImageUploading(false);
    }
  };

  // Remove an image
  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Handle file input change for video upload with validation
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

    // Check file sizes - large files may cause issues
    const MAX_SIZE_MB = 50; // 50MB
    const oversizedFiles = files.filter(file => file.size > MAX_SIZE_MB * 1024 * 1024);
    
    if (oversizedFiles.length > 0) {
      setToastMessage(`Some videos exceed ${MAX_SIZE_MB}MB. Upload may fail or be slow.`);
      setToastType('warning');
      setShowToast(true);
    }
    
    // Check if total count will exceed limit
    if (files.length + videoPreview.length + formData.videoUrls.length > 2) {
      setToastMessage('You can upload a maximum of 2 videos per product');
      setToastType('error');
      setShowToast(true);
      return;
    }
    
    // Create previews of the selected videos
    files.forEach(file => {
      // Calculate file size in MB
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(prev => [...prev, {
          url: reader.result,
          name: file.name,
          type: file.type,
          size: fileSizeMB + ' MB'
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Upload videos to server with progress tracking
  const handleVideoUpload = async (e) => {
    e.preventDefault();
    const videoInput = videoInputRef.current;
    
    if (!videoInput.files || videoInput.files.length === 0) {
      setToastMessage('Please select videos to upload');
      setToastType('error');
      setShowToast(true);
      return;
    }
    
    const files = Array.from(videoInput.files);
    
    // Validate file types
    const invalidFiles = files.filter(file => !file.type.startsWith('video/'));
    if (invalidFiles.length > 0) {
      setToastMessage('Please select valid video files');
      setToastType('error');
      setShowToast(true);
      return;
    }
    
    // Check file sizes - warn if large files may take time
    const totalSizeMB = files.reduce((size, file) => size + file.size / (1024 * 1024), 0).toFixed(2);
    if (totalSizeMB > 20) {
      setToastMessage(`Large video files (${totalSizeMB}MB) may take some time to upload`);
      setToastType('info');
      setShowToast(true);
    }
    
    try {
      setVideoUploading(true);
      setToastMessage('Starting video upload, please wait...');
      setToastType('info');
      setShowToast(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setToastMessage('Authentication required. Please log in again.');
        setToastType('error');
        setShowToast(true);
        setVideoUploading(false);
        return;
      }
      
      const formData = new FormData();
      files.forEach(file => {
        // Compress or validate video files if needed
        formData.append('videos', file);
      });
      
      // Add upload progress tracking
      const response = await axios.post(
        `${API_BASE_URL}/upload/videos`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-auth-token': token
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setToastMessage(`Uploading videos: ${percentCompleted}% complete`);
            setToastType('info');
            setShowToast(true);
          },
          // Set longer timeout for large files
          timeout: 300000 // 5 minutes
        }
      );
      
      // Update form data with the Cloudinary URLs
      setFormData(prev => ({
        ...prev,
        videoUrls: [...prev.videoUrls, ...response.data.filePaths]
      }));
      
      setToastMessage('Videos uploaded successfully');
      setToastType('success');
      setShowToast(true);
      
      // Clear the file input and preview
      videoInput.value = '';
      setVideoPreview([]);
      
    } catch (error) {
      console.error('Error uploading videos:', error);
      let errorMessage = 'Failed to upload videos';
      
      if (error.response) {
        console.error('Error response:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        console.error('Error request:', error.request);
        errorMessage = 'No response from server. Check your network connection.';
      } else {
        console.error('Error message:', error.message);
        errorMessage = error.message;
      }
      
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
    } finally {
      setVideoUploading(false);
    }
  };

  // Remove a video
  const handleRemoveVideo = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      videoUrls: prev.videoUrls.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    if (isNaN(formData.discount) || parseFloat(formData.discount) < 0 || parseFloat(formData.discount) >= parseFloat(formData.price)) {
      errors.discount = 'Discount must be less than price';
    }
    if (formData.imageUrls.length === 0) errors.imageUrls = 'At least one image is required';
    if (isNaN(formData.stock) || parseInt(formData.stock) < 0) errors.stock = 'Stock cannot be negative';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form to add or update a product
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setToastMessage('Please fix the form errors before submitting');
      setToastType('error');
      setShowToast(true);
      return;
    }
    
    try {
      // Use a more specific loading state for product submission
      const isUpdating = isEditing;
      setProductsLoading(true);
      
      // Format the data for API
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount),
        sellingPrice: parseFloat(formData.sellingPrice),
        stock: parseInt(formData.stock),
        rating: parseFloat(formData.rating)
      };
      
      // Get the token from localStorage or from context
      const token = localStorage.getItem('token');
      
      if (!token) {
        setToastMessage('Authentication error. Please log in again.');
        setToastType('error');
        setShowToast(true);
        setProductsLoading(false);
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
      setProductsLoading(false);
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
      videoUrls: product.videoUrls || [],
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
      setProductsLoading(true);
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
      setProductsLoading(false);
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
      videoUrls: [],
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
      setUsersLoading(true);
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
      setUsersLoading(false);
    }
  };

  // Fetch user details and orders
  const fetchUserDetails = async (userId) => {
    try {
      setUsersLoading(true);
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
      setUsersLoading(false);
    }
  };

  // Handle user status update
  const handleUserStatusUpdate = async () => {
    try {
      setUsersLoading(true);
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
      setUsersLoading(false);
    }
  };

  // Handle user deletion
  const handleUserDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      setUsersLoading(true);
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
      setUsersLoading(false);
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
      setOrdersLoading(true);
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
      setOrdersLoading(false);
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
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');

  const fetchRequests = async () => {
    try {
      setRequestsLoading(true);
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
      setRequestsLoading(false);
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
      setRequestsLoading(true);
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
      setRequestsLoading(false);
    }
  };

  const handleOrderAction = async (orderId, action) => {
    try {
      setOrdersLoading(true);
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
    } finally {
      setOrdersLoading(false);
    }
  };

  if (isInitialLoading) {
    return <LoadingScreen />;
  }

  // Loading indicator component
  const LoadingIndicator = () => (
    <div className="flex justify-center items-center h-48">
      <div className="flex flex-col items-center">
        <FiLoader className="animate-spin w-8 h-8 text-purple-500 mb-2" />
        <span className="text-sm text-gray-500">Loading data...</span>
      </div>
    </div>
  );

  // User Modal Component
  const UserDetailModal = () => {
    if (!selectedUser) return null;
    
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
              <button 
                onClick={() => setShowUserModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">User Information</h3>
                <div className="space-y-3">
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
                  <p><span className="font-medium">Joined:</span> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Actions</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2">Update Status:</label>
                      <div className="flex gap-2">
                        <button 
                          className={`px-3 py-2 rounded-md ${userAction === 'active' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                          onClick={() => setUserAction('active')}
                        >
                          <FiUserCheck className="inline mr-1" /> Activate
                        </button>
                        <button 
                          className={`px-3 py-2 rounded-md ${userAction === 'banned' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                          onClick={() => setUserAction('banned')}
                        >
                          <FiUserX className="inline mr-1" /> Ban
                        </button>
                      </div>
                    </div>
                    
                    {userAction === 'banned' && (
                      <div>
                        <label className="block mb-2">Ban Reason:</label>
                        <textarea
                          className="w-full border border-gray-300 rounded-md p-2"
                          value={banReason}
                          onChange={(e) => setBanReason(e.target.value)}
                          placeholder="Provide a reason for banning this user"
                        />
                        <label className="block mt-2 mb-2">Ban Expiry (optional):</label>
                        <input
                          type="date"
                          className="w-full border border-gray-300 rounded-md p-2"
                          value={banExpiry}
                          onChange={(e) => setBanExpiry(e.target.value)}
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-end mt-6">
                      <button
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md mr-2"
                        onClick={() => setShowUserModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 bg-purple-600 text-white rounded-md flex items-center"
                        onClick={handleUserStatusUpdate}
                        disabled={usersLoading}
                      >
                        {usersLoading ? (
                          <>
                            <FiLoader className="animate-spin mr-2" />
                            Updating...
                          </>
                        ) : (
                          <>Update Status</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Order History</h3>
                {userOrders.length === 0 ? (
                  <p className="text-gray-500">No orders found for this user.</p>
                ) : (
                  <div className="overflow-y-auto max-h-[400px]">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {userOrders.map(order => (
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{order._id.slice(-6)}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{order.totalAmount.toFixed(2)}</td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Order Modal Component
  const OrderDetailModal = () => {
    if (!selectedOrder) return null;
    
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
              <button 
                onClick={() => setShowOrderModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            
            {loadingOrderDetails ? (
              <div className="flex justify-center items-center h-48">
                <div className="flex flex-col items-center">
                  <FiLoader className="animate-spin w-8 h-8 text-purple-500 mb-2" />
                  <span className="text-sm text-gray-500">Loading order details...</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Order Information</h3>
                  <div className="space-y-3">
                    <p><span className="font-medium">Order ID:</span> {selectedOrder._id}</p>
                    <p><span className="font-medium">Customer:</span> {selectedOrder.user?.name || 'Unknown'}</p>
                    <p><span className="font-medium">Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        selectedOrder.status === 'completed' ? 'bg-green-100 text-green-800' :
                        selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedOrder.status}
                      </span>
                    </p>
                    <p><span className="font-medium">Total Amount:</span> ₹{selectedOrder.totalAmount.toFixed(2)}</p>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Shipping Information</h3>
                    <div className="space-y-3">
                      <p><span className="font-medium">Address:</span> {selectedOrder.shippingAddress?.street || 'N/A'}</p>
                      <p><span className="font-medium">City:</span> {selectedOrder.shippingAddress?.city || 'N/A'}</p>
                      <p><span className="font-medium">State:</span> {selectedOrder.shippingAddress?.state || 'N/A'}</p>
                      <p><span className="font-medium">Postal Code:</span> {selectedOrder.shippingAddress?.postalCode || 'N/A'}</p>
                      <p><span className="font-medium">Country:</span> {selectedOrder.shippingAddress?.country || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Actions</h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className={`px-3 py-2 rounded-md flex items-center ${
                          selectedOrder.status === 'pending' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                        onClick={() => handleOrderStatusUpdate(selectedOrder._id, 'approved')}
                        disabled={selectedOrder.status !== 'pending' || ordersLoading}
                      >
                        {ordersLoading ? (
                          <FiLoader className="animate-spin mr-1" />
                        ) : (
                          <FiCheck className="mr-1" />
                        )}
                        Approve
                      </button>
                      <button
                        className={`px-3 py-2 rounded-md flex items-center ${
                          selectedOrder.status === 'pending' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
                        }`}
                        onClick={() => handleOrderStatusUpdate(selectedOrder._id, 'rejected')}
                        disabled={selectedOrder.status !== 'pending' || ordersLoading}
                      >
                        {ordersLoading ? (
                          <FiLoader className="animate-spin mr-1" />
                        ) : (
                          <FiX className="mr-1" />
                        )}
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Order Items</h3>
                  <div className="overflow-y-auto max-h-[400px]">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedOrder.items.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center">
                                <img src={item.product.imageUrls[0]} alt={item.product.name} className="w-10 h-10 object-cover rounded-md mr-2" />
                                <span>{item.product.name}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{item.price.toFixed(2)}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Request Modal Component
  const RequestDetailModal = () => {
    if (!selectedRequest) return null;
    
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
              <button 
                onClick={() => setShowRequestModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Request Information</h3>
                <div className="space-y-3">
                  <p><span className="font-medium">Request ID:</span> {selectedRequest._id}</p>
                  <p><span className="font-medium">Type:</span> {selectedRequest.type}</p>
                  <p><span className="font-medium">Customer:</span> {selectedRequest.user?.name || 'Unknown'}</p>
                  <p><span className="font-medium">Date:</span> {new Date(selectedRequest.createdAt).toLocaleString()}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedRequest.status === 'approved' ? 'bg-green-100 text-green-800' :
                      selectedRequest.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      selectedRequest.status === 'deleted' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedRequest.status}
                    </span>
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Request Details</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="whitespace-pre-wrap">{selectedRequest.description}</p>
                </div>
              </div>
              
              {(selectedRequest.status === 'pending' || selectedRequest.status === 'pending_review') && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Admin Response</h3>
                  <textarea
                    className="w-full border border-gray-300 rounded-md p-2 h-40"
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="Enter your response to this request..."
                  />
                  
                  <div className="flex justify-end mt-4 space-x-2">
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded-md flex items-center"
                      onClick={() => handleRequestStatusUpdate(selectedRequest._id, 'rejected')}
                      disabled={requestsLoading}
                    >
                      {requestsLoading ? (
                        <>
                          <FiLoader className="animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>Reject Request</>
                      )}
                    </button>
                    <button
                      className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center"
                      onClick={() => handleRequestStatusUpdate(selectedRequest._id, 'approved')}
                      disabled={requestsLoading}
                    >
                      {requestsLoading ? (
                        <>
                          <FiLoader className="animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>Approve Request</>
                      )}
                    </button>
                  </div>
                </div>
              )}
              
              {selectedRequest.adminResponse && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Previous Admin Response</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedRequest.adminResponse}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

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
            {dashboardLoading ? (
              <LoadingIndicator />
            ) : (
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
              </>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Products Management</h2>
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('add-product');
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
              >
                <FiPlusCircle className="mr-2" />
                Add New Product
              </button>
            </div>
            <div className="p-6">
              {productsLoading ? (
                <LoadingIndicator />
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No products found</p>
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
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">User Management</h2>
            </div>
            <div className="p-6">
              {usersLoading ? (
                <LoadingIndicator />
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
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Orders Management</h2>
            </div>
            <div className="p-6">
              {ordersLoading ? (
                <LoadingIndicator />
              ) : (
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
                      {orderRequests.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order._id.slice(-6)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.user?.name || 'Unknown User'}
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
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Custom Requests</h2>
            </div>
            <div className="p-6">
              {requestsLoading ? (
                <LoadingIndicator />
              ) : (
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
                      {requests.map((request) => (
                        <tr 
                          key={request._id} 
                          className={`hover:bg-gray-50 ${request.deleted ? 'opacity-50' : ''}`}
                        >
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${request.deleted ? 'line-through' : ''}`}>
                            {request._id.slice(-6)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${request.deleted ? 'line-through' : ''}`}>
                            {request.user?.name || 'Unknown User'}
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
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'add-product' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-secondary-washed">
            <div className="px-6 py-4 border-b border-secondary-washed bg-gradient-to-r from-neutral to-white">
              <h2 className="text-xl font-heading font-semibold text-accent">
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </h2>
            </div>
            <div className="p-6 bg-gradient-to-br from-white to-neutral/30">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="border-b border-secondary-washed pb-6">
                  <h3 className="text-lg font-heading text-primary mb-4 border-l-4 border-primary pl-3 py-1">Product Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="transition-all duration-200 hover:shadow-sm">
                        <label htmlFor="name" className="block text-sm font-medium text-accent mb-1">Product Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md border-secondary-washed shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-30 font-body text-accent ${formErrors.name ? 'border-error' : ''} bg-neutral/30 py-2 px-3 transition-all duration-200`}
                        />
                        {formErrors.name && <p className="mt-1 text-sm text-error">{formErrors.name}</p>}
                      </div>
                      
                      <div className="transition-all duration-200 hover:shadow-sm">
                        <label htmlFor="description" className="block text-sm font-medium text-accent mb-1">Short Description</label>
                        <textarea
                          id="description"
                          name="description"
                          rows={3}
                          value={formData.description}
                          onChange={handleInputChange}
                          className={`mt-1 block w-full rounded-md border-secondary-washed shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-30 font-body text-accent ${formErrors.description ? 'border-error' : ''} bg-neutral/30 py-2 px-3 transition-all duration-200`}
                        />
                        {formErrors.description && <p className="mt-1 text-sm text-error">{formErrors.description}</p>}
                      </div>
                    </div>
                    
                    <div className="transition-all duration-200 hover:shadow-sm">
                      <label htmlFor="detailedDescription" className="block text-sm font-medium text-accent mb-1">Detailed Description</label>
                      <textarea
                        id="detailedDescription"
                        name="detailedDescription"
                        rows={8}
                        value={formData.detailedDescription}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-secondary-washed shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-30 font-body text-accent bg-neutral/30 py-2 px-3 transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Pricing & Inventory */}
                <div className="border-b border-secondary-washed pb-6">
                  <h3 className="text-lg font-heading text-primary mb-4 border-l-4 border-primary pl-3 py-1">Pricing & Inventory</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="transition-all duration-200 hover:shadow-sm">
                          <label htmlFor="price" className="block text-sm font-medium text-accent mb-1">Price (₹)</label>
                          <input
                            type="number"
                            id="price"
                            name="price"
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full rounded-md border-secondary-washed shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-30 font-body text-accent ${formErrors.price ? 'border-error' : ''} bg-neutral/30 py-2 px-3 transition-all duration-200`}
                          />
                          {formErrors.price && <p className="mt-1 text-sm text-error">{formErrors.price}</p>}
                        </div>
                        
                        <div className="transition-all duration-200 hover:shadow-sm">
                          <label htmlFor="discount" className="block text-sm font-medium text-accent mb-1">Discount (₹)</label>
                          <input
                            type="number"
                            id="discount"
                            name="discount"
                            min="0"
                            step="0.01"
                            value={formData.discount}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full rounded-md border-secondary-washed shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-30 font-body text-accent ${formErrors.discount ? 'border-error' : ''} bg-neutral/30 py-2 px-3 transition-all duration-200`}
                          />
                          {formErrors.discount && <p className="mt-1 text-sm text-error">{formErrors.discount}</p>}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="transition-all duration-200 hover:shadow-sm">
                          <label htmlFor="sellingPrice" className="block text-sm font-medium text-accent mb-1">Selling Price (₹)</label>
                          <input
                            type="number"
                            id="sellingPrice"
                            name="sellingPrice"
                            value={formData.sellingPrice}
                            disabled
                            className="mt-1 block w-full rounded-md border-secondary-washed shadow-sm font-body text-accent bg-neutral/50 py-2 px-3 opacity-80"
                          />
                        </div>
                        
                        <div className="transition-all duration-200 hover:shadow-sm">
                          <label htmlFor="stock" className="block text-sm font-medium text-accent mb-1">Stock</label>
                          <input
                            type="number"
                            id="stock"
                            name="stock"
                            min="0"
                            value={formData.stock}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full rounded-md border-secondary-washed shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-30 font-body text-accent ${formErrors.stock ? 'border-error' : ''} bg-neutral/30 py-2 px-3 transition-all duration-200`}
                          />
                          {formErrors.stock && <p className="mt-1 text-sm text-error">{formErrors.stock}</p>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-neutral rounded-lg p-5 w-full transition-all duration-200 hover:shadow-md">
                        <div className="flex items-center mb-4">
                          <input
                            type="checkbox"
                            id="isAvailable"
                            name="isAvailable"
                            checked={formData.isAvailable}
                            onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                            className="h-4 w-4 rounded border-secondary text-primary focus:ring-primary focus:ring-opacity-30 transition-all duration-200"
                          />
                          <label htmlFor="isAvailable" className="ml-2 block text-sm text-accent">Available for Purchase</label>
                        </div>
                        <div className="text-sm text-secondary italic">
                          {formData.isAvailable 
                            ? "This product will be displayed in the shop and can be purchased by customers." 
                            : "This product will be hidden from the shop and cannot be purchased."}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Categories & Tags */}
                <div className="border-b border-secondary-washed pb-6">
                  <h3 className="text-lg font-heading text-primary mb-4 border-l-4 border-primary pl-3 py-1">Categories & Tags</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="transition-all duration-200 hover:shadow-sm bg-white p-4 rounded-md border border-secondary-washed bg-gradient-to-r from-white to-neutral/30">
                      <label className="block text-sm font-medium text-accent mb-2">Categories</label>
                      <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
                        {formData.categories.map((category, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary bg-opacity-10 text-primary"
                          >
                            {category}
                            <button
                              type="button"
                              onClick={() => handleRemoveCategory(category)}
                              className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-primary hover:bg-primary hover:text-white"
                            >
                              <span className="sr-only">Remove category</span>
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="block w-full rounded-md border-secondary-washed shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-30 font-body text-accent bg-neutral/30 py-2 px-3 transition-all duration-200 appearance-none bg-no-repeat bg-right"
                          style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239B7D7D' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                        >
                          <option value="">Select Category</option>
                          <option value="necklace">Necklace</option>
                          <option value="earrings">Earrings</option>
                          <option value="bracelet">Bracelet</option>
                          <option value="ring">Ring</option>
                          <option value="anklet">Anklet</option>
                          <option value="custom">Custom Category</option>
                        </select>
                        {newCategory === 'custom' && (
                          <input
                            type="text"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            placeholder="Enter custom category"
                            className="block w-full rounded-md border-secondary-washed shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-30 font-body text-accent bg-neutral/30 py-2 px-3 transition-all duration-200"
                          />
                        )}
                        <button
                          type="button"
                          onClick={handleAddCategory}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-washed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary hover:shadow-md"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                    
                    <div className="transition-all duration-200 hover:shadow-sm bg-white p-4 rounded-md border border-secondary-washed bg-gradient-to-r from-white to-neutral/30">
                      <label className="block text-sm font-medium text-accent mb-2">Tags</label>
                      <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
                        {formData.tags.map((tag, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary bg-opacity-10 text-secondary"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-secondary hover:bg-secondary hover:text-white"
                            >
                              <span className="sr-only">Remove tag</span>
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <select
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          className="block w-full rounded-md border-secondary-washed shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-30 font-body text-accent bg-neutral/30 py-2 px-3 transition-all duration-200 appearance-none bg-no-repeat bg-right"
                          style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239B7D7D' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                        >
                          <option value="">Select Tag</option>
                          <option value="new arrival">New Arrival</option>
                          <option value="bestseller">Bestseller</option>
                          <option value="trending">Trending</option>
                          <option value="sale">Sale</option>
                          <option value="handmade">Handmade</option>
                          <option value="custom">Custom Tag</option>
                        </select>
                        {newTag === 'custom' && (
                          <input
                            type="text"
                            value={customTag}
                            onChange={(e) => setCustomTag(e.target.value)}
                            placeholder="Enter custom tag"
                            className="block w-full rounded-md border-secondary-washed shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-30 font-body text-accent bg-neutral/30 py-2 px-3 transition-all duration-200"
                          />
                        )}
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-secondary hover:bg-secondary-washed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary hover:shadow-md"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Images and Videos */}
                <div className="border-b border-secondary-washed pb-6">
                  <h3 className="text-lg font-heading text-primary mb-4 border-l-4 border-primary pl-3 py-1">Media Gallery</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="transition-all duration-200 hover:shadow-sm bg-white p-4 rounded-md border border-secondary-washed bg-gradient-to-r from-white to-neutral/30">
                      <label className="block text-sm font-medium text-accent mb-2">Product Images</label>
                      {formErrors.imageUrls && (
                        <p className="mb-2 text-sm text-error rounded-md bg-red-50 p-2">{formErrors.imageUrls}</p>
                      )}
                      <div className="flex flex-wrap gap-4 mb-4 min-h-[100px]">
                        {formData.imageUrls.map((url, index) => (
                          <div key={index} className="relative w-24 h-24 group transition-all duration-200 hover:shadow-md">
                            <img 
                              src={url} 
                              alt={`Product ${index + 1}`} 
                              className="w-24 h-24 object-cover rounded-md border border-secondary-washed"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-md"></div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute -top-2 -right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md text-error hover:bg-error hover:text-white transition-colors duration-200"
                            >
                              <span className="sr-only">Remove image</span>
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        {imagePreview.map((preview, index) => (
                          <div key={`preview-${index}`} className="relative w-24 h-24">
                            <img 
                              src={preview} 
                              alt={`Upload Preview ${index + 1}`} 
                              className="w-24 h-24 object-cover rounded-md border border-secondary-washed opacity-70"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-1 flex items-center">
                        <input
                          type="file"
                          id="productImages"
                          multiple
                          accept="image/*"
                          onChange={handleFileChange}
                          className="sr-only"
                          ref={fileInputRef}
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current.click()}
                          className="inline-flex items-center px-3 py-2 border border-secondary shadow-sm text-sm leading-4 font-medium rounded-md text-accent bg-white hover:bg-neutral transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary hover:shadow-md"
                        >
                          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Select Images
                        </button>
                        {imagePreview.length > 0 && (
                          <button
                            type="button"
                            onClick={handleImageUpload}
                            className="ml-2 inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary-washed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary hover:shadow-md"
                          >
                            <FiUpload className="mr-2 h-4 w-4" />
                            Upload {imagePreview.length} Image{imagePreview.length > 1 ? 's' : ''}
                          </button>
                        )}
                        {imageUploading && 
                          <div className="ml-3 text-sm text-primary flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                          </div>
                        }
                      </div>
                    </div>
                    
                    <div className="transition-all duration-200 hover:shadow-sm bg-white p-4 rounded-md border border-secondary-washed bg-gradient-to-r from-white to-neutral/30">
                      <label className="block text-sm font-medium text-accent mb-2">Product Videos</label>
                      <div className="flex flex-wrap gap-4 mb-4 min-h-[100px]">
                        {formData.videoUrls.map((url, index) => (
                          <div key={index} className="relative w-32 h-24 group transition-all duration-200 hover:shadow-md">
                            <video 
                              src={url}
                              className="w-32 h-24 object-cover rounded-md border border-secondary-washed bg-neutral"
                              muted
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-md"></div>
                            <button
                              type="button"
                              onClick={() => handleRemoveVideo(index)}
                              className="absolute -top-2 -right-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md text-error hover:bg-error hover:text-white transition-colors duration-200"
                            >
                              <span className="sr-only">Remove video</span>
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        {videoPreview.map((preview, index) => (
                          <div key={`video-preview-${index}`} className="relative w-32 h-24">
                            <div className="w-32 h-24 bg-neutral rounded-md flex items-center justify-center border border-secondary-washed">
                              <svg className="h-8 w-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-1 flex items-center">
                        <input
                          type="file"
                          id="productVideos"
                          multiple
                          accept="video/*"
                          onChange={handleVideoFileChange}
                          className="sr-only"
                          ref={videoInputRef}
                        />
                        <button
                          type="button"
                          onClick={() => videoInputRef.current.click()}
                          className="inline-flex items-center px-3 py-2 border border-secondary shadow-sm text-sm leading-4 font-medium rounded-md text-accent bg-white hover:bg-neutral transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary hover:shadow-md"
                        >
                          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Select Videos
                        </button>
                        {videoPreview.length > 0 && (
                          <button
                            type="button"
                            onClick={handleVideoUpload}
                            className="ml-2 inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-primary hover:bg-primary-washed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary hover:shadow-md"
                          >
                            <FiVideo className="mr-2 h-4 w-4" />
                            Upload {videoPreview.length} Video{videoPreview.length > 1 ? 's' : ''}
                          </button>
                        )}
                        {videoUploading && 
                          <div className="ml-3 text-sm text-primary flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4 pt-4 mt-8 border-t border-secondary-washed pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab('products');
                    }}
                    className="inline-flex items-center px-4 py-2 border border-secondary text-sm font-medium rounded-md text-accent bg-white hover:bg-neutral transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary hover:shadow-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={productsLoading}
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-washed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-primary disabled:bg-opacity-50 hover:shadow-md"
                  >
                    {productsLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </div>
                    ) : (
                      <>{isEditing ? 'Update Product' : 'Add Product'}</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showUserModal && <UserDetailModal />}
        {showOrderModal && <OrderDetailModal />}
        {showRequestModal && <RequestDetailModal />}
        
        {showToast && (
          <Toast
            message={toastMessage}
            type={toastType}
            onClose={() => setShowToast(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;