const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const { sendError } = require('../utils/response');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      return sendError(res, 'No token provided', 401);
    }

    const token = header.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, 'User no longer exists', 401);
    }

    req.user = user;
    next();
  } catch {
    return sendError(res, 'Invalid or expired token', 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(res, 'You are not allowed to do this', 403);
    }
    next();
  };
};

module.exports = { authenticate, authorize };
