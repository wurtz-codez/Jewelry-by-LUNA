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

// Get all jewelry items with search, pagination, sorting, and filtering
router.get('/', async (req, res) => {
  try {
    const {
      search,
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'desc',
      category,
      minPrice,
      maxPrice,
      tag
    } = req.query;

    // Build query
    const query = {};

    // Search in name and description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category && category !== 'all') {
      query.categories = category;
    }

    // Filter by tag
    if (tag && tag !== 'all') {
      query.tags = tag;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.sellingPrice = {};
      if (minPrice) query.sellingPrice.$gte = Number(minPrice);
      if (maxPrice) query.sellingPrice.$lte = Number(maxPrice);
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get total count for pagination
    const total = await Jewelry.countDocuments(query);

    // Get products with sorting
    const jewelry = await Jewelry.find(query)
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit));

    // Get all unique categories and tags for filters
    const categories = await Jewelry.distinct('categories');
    const tags = await Jewelry.distinct('tags');

    res.json({
      products: jewelry,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      },
      filters: {
        categories,
        tags
      }
    });
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