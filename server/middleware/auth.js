const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    console.log('Auth middleware called');
    
    // Check for token in different header formats
    let token = req.header('x-auth-token') || 
                req.header('authorization')?.replace('Bearer ', '') || 
                req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token found in headers');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    console.log('Token found, verifying...');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully:', decoded.user ? decoded.user.id : 'No user in token');
      
      if (!decoded.user || !decoded.user.id) {
        console.log('Invalid token structure, no user ID found');
        return res.status(401).json({ message: 'Invalid token structure' });
      }
      
      const user = await User.findById(decoded.user.id);
      
      if (!user) {
        console.log('User not found with ID:', decoded.user.id);
        return res.status(401).json({ message: 'User not found' });
      }
      
      console.log('User found:', user.name);

      // Check if user is banned
      if (user.status === 'banned') {
        console.log('User is banned');
        return res.status(403).json({ 
          message: 'Account is banned',
          banReason: user.banReason,
          banExpiry: user.banExpiry
        });
      }

      // Set user data on request object
      req.user = {
        _id: user._id,
        id: user._id, // Include both formats for compatibility
        name: user.name,
        email: user.email,
        role: user.role
      };
      
      console.log('Auth middleware successful, user set on request:', req.user._id);
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError.message);
      return res.status(401).json({ message: 'Token is not valid', error: jwtError.message });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Server error in authentication', error: error.message });
  }
};

module.exports = auth;