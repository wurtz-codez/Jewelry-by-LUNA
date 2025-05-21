const express = require('express');
const router = express.Router();
const Jewelry = require('../models/Jewelry');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Simple in-memory cache with TTL
const cache = {
  data: {},
  timestamps: {},
  ttl: 5 * 60 * 1000, // 5 minutes in milliseconds
  
  set: function(key, value) {
    this.data[key] = value;
    this.timestamps[key] = Date.now();
  },
  
  get: function(key) {
    const timestamp = this.timestamps[key];
    if (timestamp && Date.now() - timestamp < this.ttl) {
      return this.data[key];
    }
    return null;
  },
  
  invalidate: function(key) {
    delete this.data[key];
    delete this.timestamps[key];
  },
  
  clear: function() {
    this.data = {};
    this.timestamps = {};
  }
};

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
    
    // Invalidate cache when new item is added
    cache.clear();
    
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

    // Generate cache key based on query parameters
    const cacheKey = JSON.stringify({ search, page, limit, sort, order, category, minPrice, maxPrice, tag });
    
    // Check if we have a cached response
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }

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

    // Create index for better performance if sorting by a field
    if (sort !== '_id') {
      const indexField = {};
      indexField[sort] = 1;
      await Jewelry.collection.createIndex(indexField);
    }

    // Get products with sorting
    const jewelry = await Jewelry.find(query)
      .sort({ [sort]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(); // Use lean() for better performance

    // Get all unique categories and tags for filters
    const categories = await Jewelry.distinct('categories');
    const tags = await Jewelry.distinct('tags');

    const result = {
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
    };

    // Cache the result
    cache.set(cacheKey, result);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific jewelry item
router.get('/:id', async (req, res) => {
  try {
    const cacheKey = `jewelry_${req.params.id}`;
    const cachedItem = cache.get(cacheKey);
    
    if (cachedItem) {
      return res.json(cachedItem);
    }
    
    const jewelry = await Jewelry.findById(req.params.id).lean();
    if (!jewelry) {
      return res.status(404).json({ message: 'Jewelry item not found' });
    }
    
    // Cache the result
    cache.set(cacheKey, jewelry);
    
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
    
    // Invalidate cache for this item and all listings
    cache.invalidate(`jewelry_${req.params.id}`);
    cache.clear();
    
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
    
    // Invalidate cache for this item and all listings
    cache.invalidate(`jewelry_${req.params.id}`);
    cache.clear();
    
    res.json({ message: 'Jewelry item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 