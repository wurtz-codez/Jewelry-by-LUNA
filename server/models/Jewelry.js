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
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { product: this._id } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    this.rating = Math.round(stats[0].averageRating * 10) / 10;
    this.reviewCount = stats[0].count;
  } else {
    this.rating = 0;
    this.reviewCount = 0;
  }
  
  await this.save();
};

const Jewelry = mongoose.model('Jewelry', jewelrySchema);

module.exports = Jewelry;