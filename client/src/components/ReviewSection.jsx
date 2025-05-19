import React, { useState } from 'react';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';

const ReviewSection = ({ productId }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
  };

  return (
    <section className="mt-6 mb-8">
      <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-3">
        <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="inline-flex items-center px-3 py-1.5 border border-[rgb(165,97,108)] text-sm font-medium rounded-md shadow-sm text-[rgb(165,97,108)] bg-white hover:bg-[rgb(250,240,242)] focus:outline-none transition-colors"
        >
          {showReviewForm ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Write a Review
            </>
          )}
        </button>
      </div>

      {showReviewForm && (
        <div className="mb-6">
          <h3 className="text-base font-medium text-gray-900 mb-3">Share Your Experience</h3>
          <ReviewForm
            productId={productId}
            onReviewSubmitted={handleReviewSubmitted}
          />
        </div>
      )}

      <ReviewList productId={productId} />
    </section>
  );
};

export default ReviewSection; 