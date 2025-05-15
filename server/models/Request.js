const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  type: {
    type: String,
    enum: ['replacement', 'refund'],
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  imageUrls: [{
    type: String,
    required: false
  }],
  videoUrls: [{
    type: String,
    required: false
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'deleted'],
    default: 'pending'
  },
  adminResponse: {
    type: String,
    default: ''
  },
  deleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Request = mongoose.model('Request', requestSchema);

module.exports = Request; 