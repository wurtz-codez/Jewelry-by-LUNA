const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const Jewelry = require('../models/Jewelry');
const auth = require('../middleware/auth');

// Get user's wishlist
router.get('/', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('items', 'name sellingPrice price imageUrls description stock categories');
    
    if (!wishlist) {
      return res.json({ items: [] });
    }
    
    res.json(wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to wishlist
router.post('/items', auth, async (req, res) => {
  try {
    const { jewelryId } = req.body;
    
    // Find or create user's wishlist
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.id, items: [] });
    }
    
    // Check if item already exists in wishlist
    if (!wishlist.items.includes(jewelryId)) {
      wishlist.items.push(jewelryId);
      await wishlist.save();
    }
    
    // Populate jewelry details before sending response
    await wishlist.populate('items', 'name sellingPrice imageUrls');
    
    res.json(wishlist);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from wishlist
router.delete('/items/:jewelryId', auth, async (req, res) => {
  try {
    const { jewelryId } = req.params;
    
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    wishlist.items = wishlist.items.filter(item => item.toString() !== jewelryId);
    await wishlist.save();
    
    await wishlist.populate('items', 'name sellingPrice imageUrls');
    res.json(wishlist);
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear wishlist
router.delete('/', auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    wishlist.items = [];
    await wishlist.save();
    
    res.json(wishlist);
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 