const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Jewelry = require('../models/Jewelry');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Middleware to verify purchase
const verifyPurchase = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      user: req.user._id,
      'items.product': req.params.productId,
      status: 'delivered'
    });

    if (!order) {
      return res.status(403).json({ message: 'You can only review products you have purchased' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error verifying purchase', error: error.message });
  }
};

// Create a review
router.post('/:productId', auth, async (req, res) => {
  try {
    console.log('Review creation request received');
    console.log('User ID:', req.user?._id);
    console.log('Product ID:', req.params.productId);
    console.log('Request body:', req.body);

    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      console.log('User not authenticated or missing ID');
      return res.status(401).json({ 
        message: 'User authentication failed. Please login again.' 
      });
    }

    const { rating, title, content } = req.body;
    const productId = req.params.productId;

    // Validate required fields
    if (!rating || !title || !content) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        message: 'Please provide all required fields: rating, title, and content' 
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      console.log('Invalid rating value:', rating);
      return res.status(400).json({ 
        message: 'Rating must be between 1 and 5' 
      });
    }

    // Ensure productId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.log('Invalid product ID format:', productId);
      return res.status(400).json({ 
        message: 'Invalid product ID format' 
      });
    }

    // Check if product exists
    const product = await Jewelry.findById(productId);
    if (!product) {
      console.log('Product not found with ID:', productId);
      return res.status(404).json({ 
        message: 'Product not found' 
      });
    }
    console.log('Product found:', product.name);

    // Check if user has already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId
    });

    if (existingReview) {
      console.log('User already reviewed this product');
      return res.status(400).json({ 
        message: 'You have already reviewed this product' 
      });
    }

    // Create new review
    const review = new Review({
      product: productId,
      user: req.user._id,
      rating: Number(rating),  // Ensure rating is a number
      title,
      content,
      verifiedPurchase: false
    });
    console.log('Review object created with user ID:', req.user._id);

    // Save the review
    try {
      const savedReview = await review.save();
      console.log('Review saved successfully:', savedReview._id);
      
      // Populate user information before sending response
      await savedReview.populate('user', 'name');
      console.log('User information populated');

      // Update product's review count and rating
      try {
        console.log('Updating product rating stats');
        await product.updateRatingStats();
        console.log('Product rating stats updated');
      } catch (ratingError) {
        console.error('Error updating product rating:', ratingError);
        // Continue sending response even if rating update fails
      }

      res.status(201).json(savedReview);
    } catch (saveError) {
      console.error('Error saving review:', saveError);
      return res.status(500).json({ 
        message: 'Error saving review', 
        error: saveError.message 
      });
    }
  } catch (error) {
    console.error('Error in review creation route:', error);
    res.status(500).json({ 
      message: 'Error creating review', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get reviews for a product with pagination
router.get('/:productId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ product: req.params.productId });

    res.json({
      reviews,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReviews: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

// Update a review
router.put('/:reviewId', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    const { rating, title, content } = req.body;
    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.content = content || review.content;
    review.updatedAt = Date.now();

    await review.save();

    // Update product's rating
    const product = await Jewelry.findById(review.product);
    await product.updateRatingStats();

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
});

// Delete a review
router.delete('/:reviewId', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await review.remove();

    // Update product's rating
    const product = await Jewelry.findById(review.product);
    await product.updateRatingStats();

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
});

// Add a comment to a review
router.post('/:reviewId/comments', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    review.comments.push({
      user: req.user._id,
      content: req.body.content
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
});

// Update a comment
router.put('/:reviewId/comments/:commentId', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const comment = review.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    comment.content = req.body.content;
    comment.updatedAt = Date.now();

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error updating comment', error: error.message });
  }
});

// Delete a comment
router.delete('/:reviewId/comments/:commentId', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const comment = review.comments.id(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    comment.remove();
    await review.save();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
});

// Vote on a review (helpful/not helpful)
router.post('/:reviewId/vote', auth, async (req, res) => {
  try {
    const { voteType } = req.body; // 'helpful' or 'notHelpful'
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (voteType === 'helpful') {
      review.helpfulVotes += 1;
    } else if (voteType === 'notHelpful') {
      review.notHelpfulVotes += 1;
    } else {
      return res.status(400).json({ message: 'Invalid vote type' });
    }

    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error voting on review', error: error.message });
  }
});

// Get rating distribution for a product
router.get('/:productId/distribution', async (req, res) => {
  try {
    const distribution = await Review.aggregate([
      { $match: { product: req.params.productId } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert the distribution array to an object with rating as key
    const ratingDistribution = distribution.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    });

    res.json(ratingDistribution);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rating distribution', error: error.message });
  }
});

module.exports = router; 