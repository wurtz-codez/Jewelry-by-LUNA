const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Order = require('../models/Order');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/requests/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new request
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { orderId, type, reason } = req.body;
    
    // Verify the order exists and belongs to the user
    const order = await Order.findOne({ _id: orderId, user: req.user.id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if there's an existing non-deleted request for this order
    const existingRequest = await Request.findOne({
      order: orderId,
      user: req.user.id,
      deleted: { $ne: true } // Only check for non-deleted requests
    });

    if (existingRequest) {
      return res.status(400).json({ 
        message: 'You already have an active request for this order. Please wait for it to be processed or deleted by admin.' 
      });
    }

    // Create the request
    const request = new Request({
      user: req.user.id,
      order: orderId,
      type,
      reason,
      imageUrl: req.file ? req.file.path : null,
      deleted: false // Explicitly set deleted to false
    });

    await request.save();
    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's requests
router.get('/user', auth, async (req, res) => {
  try {
    const requests = await Request.find({ user: req.user.id })
      .populate('order')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all requests (Admin only)
router.get('/admin', auth, isAdmin, async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('user', 'name email')
      .populate('order')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error('Error fetching all requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update request status (Admin only)
router.put('/:requestId/status', auth, isAdmin, async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    const request = await Request.findById(req.params.requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = status;
    request.adminResponse = adminResponse || '';
    await request.save();

    res.json(request);
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete request (Admin only)
router.delete('/:requestId', auth, isAdmin, async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Mark the request as deleted
    request.status = 'deleted';
    request.deleted = true;
    await request.save();

    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 