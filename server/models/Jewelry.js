const mongoose = require('mongoose');

const jewelrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  detailedDescription: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  categories: [{
    type: String,
    required: true
  }],
  tags: [{
    type: String,
    required: true
  }],
  imageUrls: [{
    type: String,
    required: true
  }],
  videoUrls: [{
    type: String,
    required: false
  }],
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  ratingDistribution: {
    1: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    5: { type: Number, default: 0 }
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update the updatedAt timestamp and sellingPrice before saving
jewelrySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.sellingPrice = this.price - (this.discount || 0);
  next();
});

// Method to update rating and review count
jewelrySchema.methods.updateRatingStats = async function() {
  try {
    const Review = mongoose.model('Review');
    const ObjectId = mongoose.Types.ObjectId;
    
    // Ensure we have a valid ObjectId
    if (!this._id) {
      console.error('Product ID is undefined');
      return;
    }
    
    console.log('Aggregating reviews for product:', this._id);
    
    // Get distribution of ratings
    const distribution = await Review.aggregate([
      { $match: { product: new ObjectId(this._id) } },
      { 
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      }
    ]);

    // Reset distribution
    this.ratingDistribution = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };

    // Update distribution
    distribution.forEach(({ _id, count }) => {
      if (_id >= 1 && _id <= 5) {
        this.ratingDistribution[_id] = count;
      }
    });

    // Get average rating and total count
    const stats = await Review.aggregate([
      { $match: { product: new ObjectId(this._id) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('Aggregation results:', stats);

    if (stats.length > 0) {
      this.rating = Math.round(stats[0].averageRating * 10) / 10;
      this.reviewCount = stats[0].count;
      console.log(`Updated rating to ${this.rating} with ${this.reviewCount} reviews`);
    } else {
      this.rating = 0;
      this.reviewCount = 0;
      console.log('No reviews found, resetting rating to 0');
    }
    
    // Also update the reviews array
    const reviews = await Review.find({ product: this._id }).select('_id');
    this.reviews = reviews.map(review => review._id);
    
    await this.save();
    console.log('Product saved with updated rating stats');
  } catch (error) {
    console.error('Error updating rating stats:', error);
    throw error;
  }
};

const Jewelry = mongoose.model('Jewelry', jewelrySchema);

module.exports = Jewelry;