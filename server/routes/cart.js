const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Jewelry = require('../models/Jewelry');
const auth = require('../middleware/auth');

// Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate('items.jewelry', 'name sellingPrice imageUrl');
    
    if (!cart) {
      return res.json({ items: [] });
    }
    
    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to cart
router.post('/items', auth, async (req, res) => {
  try {
    const { jewelryId, quantity } = req.body;
    
    // Find or create user's cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }
    
    // Check if item already exists in cart
    const existingItem = cart.items.find(item => item.jewelry.toString() === jewelryId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ jewelry: jewelryId, quantity });
    }
    
    await cart.save();
    
    // Populate jewelry details before sending response
    await cart.populate('items.jewelry', 'name sellingPrice imageUrl');
    
    res.json(cart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update cart item quantity
router.put('/items/:jewelryId', auth, async (req, res) => {
  try {
    const { jewelryId } = req.params;
    const { quantity } = req.body;
    
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const item = cart.items.find(item => item.jewelry.toString() === jewelryId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    item.quantity = quantity;
    await cart.save();
    
    await cart.populate('items.jewelry', 'name sellingPrice imageUrl');
    res.json(cart);
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/items/:jewelryId', auth, async (req, res) => {
  try {
    const { jewelryId } = req.params;
    
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(item => item.jewelry.toString() !== jewelryId);
    await cart.save();
    
    await cart.populate('items.jewelry', 'name sellingPrice imageUrl');
    res.json(cart);
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear cart
router.delete('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = [];
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 