const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Thy identity is unknown, warrior!' });
    }

    const user = await User.findById(req.user.userId);
    
    if (user && user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access denied. Thou art not a Dungeon Master!' });
    }
  } catch (err) {
    res.status(500).json({ message: 'The Scrolls of Truth are unreadable!' });
  }
};
