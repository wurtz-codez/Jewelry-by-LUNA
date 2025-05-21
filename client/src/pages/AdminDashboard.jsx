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

const API_BASE_URL = 'https://jewelry-by-luna.onrender.com/api';

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
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);
  const [videoPreview, setVideoPreview] = useState([]);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

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
      setUploadingVideo(true);
      setToastMessage('Starting video upload, please wait...');
      setToastType('info');
      setShowToast(true);
      
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
            'x-auth-token': localStorage.getItem('token')
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
      const errorMsg = error.response?.data?.message || 
                      (error.code === 'ECONNABORTED' ? 'Upload timed out. Try with smaller files.' : 
                      'Failed to upload videos. Check your internet connection.');
      setToastMessage(errorMsg);
      setToastType('error');
      setShowToast(true);
    } finally {
      setUploadingVideo(false);
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
      setLoading(true);
      
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
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="spinner-border text-purple-500" role="status">
                  <FiLoader className="animate-spin w-8 h-8 text-purple-500" />
                </div>
              </div>
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
              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <FiLoader className="animate-spin w-8 h-8 text-purple-500" />
                </div>
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
              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <FiLoader className="animate-spin w-8 h-8 text-purple-500" />
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
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Orders Management</h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <FiLoader className="animate-spin w-8 h-8 text-purple-500" />
                </div>
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
              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <FiLoader className="animate-spin w-8 h-8 text-purple-500" />
                </div>
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