const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Jewelry = require('../models/Jewelry');
const auth = require('../middleware/auth');
const { generateWhatsAppMessage, generateWhatsAppUrl } = require('../utils/whatsappUtils');

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

    // Validate cart items
    const invalidItems = cart.items.filter(item => !item.jewelry || !item.jewelry.sellingPrice);
    if (invalidItems.length > 0) {
      return res.status(400).json({ message: 'Some items in your cart are invalid or no longer available' });
    }

    // Extract shipping and payment details from request body
    const { shippingAddress, paymentMethod, couponCode } = req.body;
    
    // Calculate discount if coupon is provided
    let discount = 0;
    if (couponCode) {
      const validCoupons = {
        'WELCOME10': 10,
        'SUMMER25': 25,
        'LUNA15': 15
      };
      
      if (validCoupons[couponCode]) {
        const discountPercentage = validCoupons[couponCode];
        const subtotal = cart.items.reduce((total, item) => total + (item.jewelry.sellingPrice * item.quantity), 0);
        discount = subtotal * (discountPercentage / 100);
      }
    }
    
    // Calculate total amount with shipping and discount
    const shipping = 15.00; // Fixed shipping cost
    const subtotal = cart.items.reduce((total, item) => total + (item.jewelry.sellingPrice * item.quantity), 0);
    const totalAmount = subtotal + shipping - discount;

    const order = new Order({
      user: req.user.id,
      items: cart.items.map(item => ({
        jewelry: item.jewelry._id,
        quantity: item.quantity,
        price: item.jewelry.sellingPrice
      })),
      totalAmount,
      status: 'pending',
      requestStatus: 'pending',
      shippingAddress,
      paymentMethod,
      paymentStatus: 'pending'
    });

    await order.save();
    
    // Generate WhatsApp message
    const user = await User.findById(req.user.id);
    const whatsappMessage = generateWhatsAppMessage(order, user);
    
    // Update order with WhatsApp message
    order.whatsappMessage = whatsappMessage;
    await order.save();
    
    // Clear the cart after creating the order
    cart.items = [];
    await cart.save();

    res.status(201).json({
      order,
      whatsappUrl: generateWhatsAppUrl(whatsappMessage)
    });
  } catch (error) {
    console.error('Error creating order request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's order requests
router.get('/user', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.jewelry', 'name imageUrl sellingPrice')
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
    // Get all orders with populated user and jewelry details
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.jewelry', 'name imageUrl sellingPrice')
      .sort({ createdAt: -1 });
    
    // Separate orders into requests and regular orders
    const orderRequests = orders.filter(order => order.requestStatus === 'pending');
    const allOrders = orders.filter(order => order.requestStatus !== 'pending');
    
    res.json({
      orderRequests,
      allOrders
    });
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
      .populate('items.jewelry', 'name imageUrl sellingPrice');
    
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
    const order = await Order.findById(req.params.orderId)
      .populate('items.jewelry');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If the status is changing to approved, reduce stock for each item
    if (status === 'approved' && order.requestStatus !== 'approved') {
      // Start a session for transaction to ensure all stock updates or none
      const session = await mongoose.startSession();
      session.startTransaction();
      
      try {
        // Validate sufficient stock before making any changes
        for (const item of order.items) {
          if (!item.jewelry || typeof item.jewelry !== 'object') {
            throw new Error(`Invalid jewelry reference for item in order ${order._id}`);
          }
          
          if (item.jewelry.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${item.jewelry.name}. Available: ${item.jewelry.stock}, Requested: ${item.quantity}`);
          }
        }
        
        // Update stock for each item in the order
        for (const item of order.items) {
          const updatedJewelry = await Jewelry.findByIdAndUpdate(
            item.jewelry._id,
            { $inc: { stock: -item.quantity } },
            { new: true, session, runValidators: true }
          );
          
          if (updatedJewelry.stock < 0) {
            throw new Error(`Stock cannot be negative for ${item.jewelry.name}`);
          }
        }
        
        // Update order status
        order.requestStatus = status;
        await order.save({ session });
        
        // Commit the transaction
        await session.commitTransaction();
        
      } catch (error) {
        // If any error occurs, abort the transaction
        await session.abortTransaction();
        console.error('Error processing order approval:', error);
        return res.status(400).json({ message: error.message });
      } finally {
        // End the session
        session.endSession();
      }
    } else {
      // Just update the status if not approving
      order.requestStatus = status;
      await order.save();
    }

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;