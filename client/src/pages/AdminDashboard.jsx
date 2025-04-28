import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp, FiPlusCircle, FiX, FiEdit, FiTrash2, FiUpload, FiImage } from 'react-icons/fi';
import Toast from '../components/Toast';
import Navbar from '../components/Navbar';
import axios from 'axios';

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
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  // Form state for adding/editing products
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'necklace',
    imageUrl: '',
    stock: 1,
    detailedDescription: '',
    rating: 0,
    isAvailable: true
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Mock data for demonstration
  const stats = [
    { title: 'Total Users', value: '1,234', icon: <FiUsers />, change: '+12%' },
    { title: 'Total Orders', value: '567', icon: <FiShoppingBag />, change: '+8%' },
    { title: 'Revenue', value: '$45,678', icon: <FiDollarSign />, change: '+15%' },
    { title: 'Growth', value: '23%', icon: <FiTrendingUp />, change: '+5%' }
  ];

  // Fetch products when the component mounts or products tab is clicked
  useEffect(() => {
    if (activeTab === 'products') {
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
    }
  }, [currentUser, navigate]);

  // Fetch products from the API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/jewelry`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setToastMessage('Failed to fetch products');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
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
    const file = e.target.files[0];
    if (!file) return;

    // Create a preview of the selected image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Upload image to server
  const handleImageUpload = async (e) => {
    e.preventDefault();
    const fileInput = fileInputRef.current;
    
    if (!fileInput.files || fileInput.files.length === 0) {
      setToastMessage('Please select an image to upload');
      setToastType('error');
      setShowToast(true);
      return;
    }
    
    const file = fileInput.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setToastMessage('Please select a valid image file');
      setToastType('error');
      setShowToast(true);
      return;
    }
    
    try {
      setUploadingImage(true);
      
      const formData = new FormData();
      formData.append('image', file);
      
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
      
      // Update form data with the image URL from the server
      setFormData(prev => ({
        ...prev,
        imageUrl: `http://localhost:5001${response.data.filePath}`
      }));
      
      setToastMessage('Image uploaded successfully');
      setToastType('success');
      setShowToast(true);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      setToastMessage(error.response?.data?.message || 'Failed to upload image');
      setToastType('error');
      setShowToast(true);
    } finally {
      setUploadingImage(false);
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) 
      errors.price = 'Price must be a positive number';
    if (!formData.stock || isNaN(formData.stock) || parseInt(formData.stock) < 0) 
      errors.stock = 'Stock must be a non-negative number';
    if (!formData.imageUrl.trim()) errors.imageUrl = 'Image URL is required';
    if (!formData.detailedDescription.trim()) errors.detailedDescription = 'Detailed description is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
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
      category: product.category,
      imageUrl: product.imageUrl,
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
      category: 'necklace',
      imageUrl: '',
      stock: 1,
      detailedDescription: '',
      rating: 0,
      isAvailable: true
    });
    setFormErrors({});
    setIsEditing(false);
    setEditingId(null);
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex space-x-4">
            <button 
              className={`px-4 py-2 rounded-lg ${activeTab === 'dashboard' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
            <button 
              className={`px-4 py-2 rounded-lg ${activeTab === 'products' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              onClick={() => setActiveTab('products')}
            >
              Products
            </button>
          </div>
        </div>
        
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm font-medium text-green-600">{stat.change}</span>
                    <span className="text-sm text-gray-500"> from last month</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">New order #1234</p>
                      <p className="text-sm text-gray-500">2 minutes ago</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                      Completed
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">New user registration</p>
                      <p className="text-sm text-gray-500">15 minutes ago</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                      New
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Product update</p>
                      <p className="text-sm text-gray-500">1 hour ago</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">
                      Updated
                    </span>
                  </div>
                </div>
              </div>
            </div>
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
              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="spinner-border text-purple-500" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              ) : products.length === 0 ? (
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map(product => (
                        <tr key={product._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-12 w-12 flex-shrink-0">
                                <img 
                                  className="h-12 w-12 object-cover rounded-md" 
                                  src={product.imageUrl} 
                                  alt={product.name}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/src/assets/placeholder.svg';
                                  }}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 capitalize">{product.category}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.stock}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {product.isAvailable ? (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Available
                              </span>
                            ) : (
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                Unavailable
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                              onClick={() => handleEdit(product)}
                            >
                              <FiEdit />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDelete(product._id)}
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
                      className={`w-full p-2 border rounded-md ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter product name"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category*
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="necklace">Necklace</option>
                      <option value="bracelet">Bracelet</option>
                      <option value="earring">Earring</option>
                      <option value="ring">Ring</option>
                      <option value="other">Other</option>
                    </select>
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
                      className={`w-full p-2 border rounded-md ${formErrors.price ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter price"
                    />
                    {formErrors.price && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.price}</p>
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
                      className={`w-full p-2 border rounded-md ${formErrors.stock ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter available stock"
                    />
                    {formErrors.stock && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.stock}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Image*
                    </label>
                    <div className={`border rounded-md p-3 ${formErrors.imageUrl ? 'border-red-500' : 'border-gray-300'}`}>
                      {/* Image preview */}
                      {(imagePreview || formData.imageUrl) && (
                        <div className="mb-3">
                          <img 
                            src={imagePreview || formData.imageUrl} 
                            alt="Product preview" 
                            className="h-40 object-contain mx-auto"
                          />
                        </div>
                      )}
                      
                      {/* File input */}
                      <div className="flex items-center justify-center">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="product-image"
                        />
                        <label 
                          htmlFor="product-image" 
                          className="cursor-pointer flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                          <FiImage className="mr-2" />
                          {imagePreview ? 'Change Image' : 'Select Image'}
                        </label>
                        
                        {imagePreview && !formData.imageUrl && (
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
                      
                      {/* Hidden field for imageUrl */}
                      <input
                        type="hidden"
                        name="imageUrl"
                        value={formData.imageUrl}
                      />
                      
                      {formData.imageUrl && (
                        <p className="mt-2 text-sm text-green-600">
                          Image uploaded successfully
                        </p>
                      )}
                    </div>
                    {formErrors.imageUrl && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.imageUrl}</p>
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
                      className="w-full p-2 border border-gray-300 rounded-md"
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
                      className={`w-full p-2 border rounded-md ${formErrors.description ? 'border-red-500' : 'border-gray-300'}`}
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
                      className={`w-full p-2 border rounded-md ${formErrors.detailedDescription ? 'border-red-500' : 'border-gray-300'}`}
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
      </div>
    </div>
  );
};

export default AdminDashboard;