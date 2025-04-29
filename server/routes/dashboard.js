const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Jewelry = require('../models/Jewelry');
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

// Get dashboard statistics
router.get('/stats', auth, isAdmin, async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    // Get total orders
    const totalOrders = await Order.countDocuments();
    
    // Get total revenue
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .populate('items.jewelry', 'name imageUrl');
    
    // Get sales data for chart (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Get top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.jewelry',
          totalSold: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);
    
    // Populate product details
    const topProductsWithDetails = await Jewelry.populate(topProducts, {
      path: '_id',
      select: 'name imageUrl price'
    });
    
    res.json({
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentOrders,
      salesData,
      topProducts: topProductsWithDetails
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user details with order history
router.get('/users/:userId', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const orders = await Order.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('items.jewelry', 'name imageUrl price');

    res.json({
      user,
      orders
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Ban or suspend user
router.put('/users/:userId/status', auth, isAdmin, async (req, res) => {
  try {
    const { status, banReason, banExpiry } = req.body;
    
    if (!['active', 'banned', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = status;
    if (status !== 'active') {
      user.banReason = banReason || '';
      user.banExpiry = banExpiry || null;
    } else {
      user.banReason = '';
      user.banExpiry = null;
    }

    await user.save();
    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a user
router.delete('/users/:userId', auth, isAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Start a session for transaction
    const session = await User.startSession();
    session.startTransaction();

    try {
      // Delete all orders associated with the user
      await Order.deleteMany({ user: userId }, { session });

      // Delete the user
      await User.findByIdAndDelete(userId, { session });

      // Commit the transaction
      await session.commitTransaction();
      
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      // If anything fails, rollback the transaction
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      message: 'Error deleting user',
      error: error.message 
    });
  }
});

module.exports = router; 