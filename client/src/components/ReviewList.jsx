import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const ReviewList = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [commentContent, setCommentContent] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const { token, currentUser } = useAuth();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://jewelry-by-luna.onrender.com/api';

  const fetchReviews = async (page = 1) => {
    if (!productId) {
      console.error('No product ID provided');
      setIsLoading(false);
      return;
    }
    
    try {
      console.log(`Fetching reviews for product ${productId}, page ${page}`);
      const response = await axios.get(
        `${API_BASE_URL}/reviews/${productId}?page=${page}&limit=5`
      );
      setReviews(response.data.reviews);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      setIsLoading(true);
      fetchReviews(currentPage);
    }
  }, [productId, currentPage]);

  const handleVote = async (reviewId, voteType) => {
    if (!currentUser || !token) {
      toast.error('Please login to vote on reviews');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/reviews/${reviewId}/vote`,
        { voteType },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        }
      );

      setReviews(reviews.map(review => 
        review._id === reviewId ? response.data : review
      ));
    } catch (error) {
      console.error('Error voting on review:', error);
    }
  };

  const handleComment = async (reviewId) => {
    if (!currentUser || !token) {
      toast.error('Please login to comment');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/reviews/${reviewId}/comments`,
        { content: commentContent[reviewId] },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        }
      );

      setReviews(reviews.map(review => 
        review._id === reviewId ? response.data : review
      ));
      setCommentContent({ ...commentContent, [reviewId]: '' });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditComment = async (reviewId, commentId) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/reviews/${reviewId}/comments/${commentId}`,
        { content: commentContent[commentId] },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        }
      );

      setReviews(reviews.map(review => 
        review._id === reviewId ? response.data : review
      ));
      setEditingComment(null);
      setCommentContent({ ...commentContent, [commentId]: '' });
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (reviewId, commentId) => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/reviews/${reviewId}/comments/${commentId}`,
        {
          headers: {
            'x-auth-token': token
          }
        }
      );

      setReviews(reviews.map(review => 
        review._id === reviewId ? response.data : review
      ));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <div key={review._id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${
                        star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="font-medium">{review.user.name}</span>
                {review.verifiedPurchase && (
                  <span className="text-green-600 text-sm">Verified Purchase</span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>

            <h3 className="mt-2 text-lg font-medium">{review.title}</h3>
            <p className="mt-2 text-gray-600">{review.content}</p>

            <div className="mt-4 flex items-center space-x-4">
              <button
                onClick={() => handleVote(review._id, 'helpful')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Helpful ({review.helpfulVotes})
              </button>
              <button
                onClick={() => handleVote(review._id, 'notHelpful')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Not Helpful ({review.notHelpfulVotes})
              </button>
            </div>

            {/* Comments Section */}
            <div className="mt-4 space-y-4">
              <h4 className="font-medium">Comments</h4>
              {review.comments && review.comments.length > 0 ? (
                review.comments.map((comment) => (
                  <div key={comment._id} className="bg-gray-50 p-4 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium">{comment.user.name}</span>
                        <p className="mt-1 text-gray-600">
                          {editingComment === comment._id ? (
                            <textarea
                              value={commentContent[comment._id] || comment.content}
                              onChange={(e) =>
                                setCommentContent({
                                  ...commentContent,
                                  [comment._id]: e.target.value
                                })
                              }
                              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              rows={2}
                            />
                          ) : (
                            comment.content
                          )}
                        </p>
                      </div>
                      {currentUser && token && comment.user._id === currentUser._id && (
                        <div className="flex space-x-2">
                          {editingComment === comment._id ? (
                            <>
                              <button
                                onClick={() => handleEditComment(review._id, comment._id)}
                                className="text-sm text-indigo-600 hover:text-indigo-800"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingComment(null)}
                                className="text-sm text-gray-600 hover:text-gray-800"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingComment(comment._id);
                                  setCommentContent({
                                    ...commentContent,
                                    [comment._id]: comment.content
                                  });
                                }}
                                className="text-sm text-indigo-600 hover:text-indigo-800"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteComment(review._id, comment._id)}
                                className="text-sm text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No comments yet</p>
              )}

              {/* Add Comment Form */}
              <div className="mt-4">
                <textarea
                  value={commentContent[review._id] || ''}
                  onChange={(e) =>
                    setCommentContent({
                      ...commentContent,
                      [review._id]: e.target.value
                    })
                  }
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  rows={2}
                  placeholder="Add a comment..."
                />
                <button
                  onClick={() => handleComment(review._id)}
                  className="mt-2 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-1 px-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-4">No reviews yet. Be the first to review this product!</div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList; 