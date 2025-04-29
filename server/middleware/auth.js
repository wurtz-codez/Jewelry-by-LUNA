const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if user is banned
    if (user.status === 'banned') {
      return res.status(403).json({ 
        message: 'Account is banned',
        banReason: user.banReason,
        banExpiry: user.banExpiry
      });
    }

    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;