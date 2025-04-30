const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
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
    console.error('Error in isAdmin middleware:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new order request
router.post('/request', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.jewelry');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const order = new Order({
      user: req.user.id,
      items: cart.items.map(item => ({
        jewelry: item.jewelry._id,
        quantity: item.quantity,
        price: item.jewelry.price
      })),
      totalAmount: cart.items.reduce((total, item) => total + (item.jewelry.price * item.quantity), 0),
      status: 'pending',
      requestStatus: 'pending'
    });

    await order.save();
    
    // Clear the cart after creating the order
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's order requests
router.get('/user', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.jewelry', 'name imageUrl price')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all order requests (Admin only)
router.get('/admin', auth, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.jewelry', 'name imageUrl price')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order by ID (Admin or order owner)
router.get('/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user', 'name email phone')
      .populate('items.jewelry', 'name imageUrl price');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is admin or the order owner
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only view your own orders.' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order request status (Admin only)
router.put('/:orderId/status', auth, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.requestStatus = status;
    await order.save();

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;