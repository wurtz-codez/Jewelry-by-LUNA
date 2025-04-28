const express = require('express');
const router = express.Router();
const Jewelry = require('../models/Jewelry');
const User = require('../models/User');
const auth = require('../middleware/auth');

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

// Create a new jewelry item (Admin only)
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const jewelry = new Jewelry(req.body);
    await jewelry.save();
    res.status(201).json(jewelry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all jewelry items
router.get('/', async (req, res) => {
  try {
    const jewelry = await Jewelry.find();
    res.json(jewelry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific jewelry item
router.get('/:id', async (req, res) => {
  try {
    const jewelry = await Jewelry.findById(req.params.id);
    if (!jewelry) {
      return res.status(404).json({ message: 'Jewelry item not found' });
    }
    res.json(jewelry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a jewelry item (Admin only)
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const jewelry = await Jewelry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!jewelry) {
      return res.status(404).json({ message: 'Jewelry item not found' });
    }
    res.json(jewelry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a jewelry item (Admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const jewelry = await Jewelry.findByIdAndDelete(req.params.id);
    if (!jewelry) {
      return res.status(404).json({ message: 'Jewelry item not found' });
    }
    res.json({ message: 'Jewelry item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 