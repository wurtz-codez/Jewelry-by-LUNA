import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const ReviewForm = ({ productId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token, currentUser } = useAuth();
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://jewelry-by-luna.onrender.com/api';

  // Validate productId when component mounts or productId changes
  useEffect(() => {
    if (!productId) {
      console.error('ProductID is missing or undefined');
    } else {
      console.log('ReviewForm initialized with productId:', productId);
    }
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate product ID
    if (!productId) {
      toast.error('Product information is missing. Please try again.');
      console.error('Missing productId in ReviewForm');
      return;
    }
    
    if (!currentUser) {
      toast.error('Please login to submit a review');
      navigate('/login');
      return;
    }

    if (!token) {
      toast.error('Authentication issue. Please login again.');
      navigate('/login');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting review for product:', productId);
      console.log('Review data:', { rating, title, content });
      
      // Create a review submission request with both auth header formats
      const response = await axios.post(
        `${API_BASE_URL}/reviews/${productId}`,
        { rating, title, content },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('Review submission successful:', response.data);
      toast.success('Review submitted successfully');
      setRating(0);
      setTitle('');
      setContent('');
      if (onReviewSubmitted) {
        onReviewSubmitted(response.data);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      console.error('Error details:', error.response?.data);
      
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please login again.');
        navigate('/login');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Please check your review information');
      } else {
        const message = error.response?.data?.message || 'Error submitting review';
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              <svg
                className={`w-7 h-7 ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300'
                } hover:text-yellow-400 transition-colors`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-500">
            {rating === 0 ? "Select a rating" : `${rating} star${rating !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Review Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-[rgb(165,97,108)] focus:ring-[rgb(165,97,108)] text-sm"
          placeholder="Summarize your experience"
          required
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Review
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-[rgb(165,97,108)] focus:ring-[rgb(165,97,108)] text-sm"
          placeholder="Share your experience with this product"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex justify-center rounded-md border border-transparent bg-[rgb(165,97,108)] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[rgb(145,77,88)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </div>
        ) : (
          'Submit Review'
        )}
      </button>
    </form>
  );
};

export default ReviewForm; 