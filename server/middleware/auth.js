const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Strict JWT Authentication Middleware (Requires valid logged-in user account)
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'studywizardsecretkey123');
      req.user = await User.findById(decoded.id).select('-password');
      if (req.user) {
        return next();
      }
    } catch (error) {
      console.error('JWT Auth Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  return res.status(401).json({ message: 'Not authorized, no token provided. Please log in.' });
};

module.exports = { protect };
