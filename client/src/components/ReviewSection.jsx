import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';

const ReviewSection = ({ productId, productRating, reviewCount }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { currentUser } = useAuth();
  
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
      <h2 className="text-2xl font-cinzel font-bold text-[#2C1810] mb-6">Customer Reviews</h2>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side - Rating Statistics */}
        <div className="lg:w-1/3">
          <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
            <div className="text-center">
              <div className="text-4xl font-cinzel font-bold text-[#2C1810] mb-4">
                {(productRating || 0).toFixed(1)}
              </div>
              <div className="flex justify-center mb-4">
                {renderRatingStars(productRating || 0)}
              </div>
              <div className="text-sm font-cormorant text-[#8B7355] mb-6">
                Based on {reviewCount || 0} reviews
              </div>

              {currentUser ? (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-[rgb(165,97,108)] font-medium rounded-md text-[rgb(165,97,108)] bg-white hover:bg-[rgb(250,240,242)] focus:outline-none transition-colors font-cormorant text-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Write a Review
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-[#8B7355] font-cormorant text-lg">Please sign in to write a review</p>
                  <Link
                    to="/login"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-[rgb(165,97,108)] font-medium rounded-md text-[rgb(165,97,108)] bg-white hover:bg-[rgb(250,240,242)] focus:outline-none transition-colors font-cormorant text-lg"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Reviews */}
        <div className="lg:w-2/3">
          {showReviewForm && currentUser && (
            <div className="mb-6 bg-[#F5E6D3]/20 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-cinzel text-[#2C1810] mb-0">Share Your Experience</h3>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="text-[#8B7355] hover:text-[#2C1810] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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