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
  price: {
    type: Number,
    required: true,
    min: 0
  },
  categories: [{
    type: String,
    required: true,
    trim: true
  }],
  tags: [{
    type: String,
    required: true,
    trim: true
  }],
  imageUrl: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  detailedDescription: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
jewelrySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Jewelry = mongoose.model('Jewelry', jewelrySchema);

module.exports = Jewelry;