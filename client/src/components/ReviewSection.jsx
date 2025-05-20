import React, { useState } from 'react';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';

const ReviewSection = ({ productId, productRating, reviewCount }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={`full-${i}`} className="text-yellow-400">★</span>
      );
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">★</span>
      );
    }

    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-yellow-400">☆</span>
      );
    }

    return stars;
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
  };

  return (
    <section className="mt-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side - Rating Statistics */}
        <div className="lg:w-1/3">
          <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-4">
                {(productRating || 0).toFixed(1)}
              </div>
              <div className="flex justify-center mb-4">
                {renderRatingStars(productRating || 0)}
              </div>
              <div className="text-sm text-gray-600 mb-6">
                Based on {reviewCount || 0} reviews
              </div>

              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-[rgb(165,97,108)] font-medium rounded-md text-[rgb(165,97,108)] bg-white hover:bg-[rgb(250,240,242)] focus:outline-none transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Write a Review
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Reviews */}
        <div className="lg:w-2/3">
          {showReviewForm && (
            <div className="mb-6 bg-gray-50 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Share Your Experience</h3>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ReviewForm
                productId={productId}
                onReviewSubmitted={handleReviewSubmitted}
              />
            </div>
          )}

          <ReviewList productId={productId} />
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;