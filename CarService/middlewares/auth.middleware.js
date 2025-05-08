// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Get token after 'Bearer '

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user to request
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

module.exports = authenticate;
