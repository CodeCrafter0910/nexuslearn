const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');

const signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return sendError(res, 'Email already in use', 409);
    }

    const user = await User.create({ name, email, password, role });
    const token = generateToken({ id: user._id, role: user.role });

    return sendSuccess(res, { user, token }, 201, 'Account created');
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const token = generateToken({ id: user._id, role: user.role });
    user.password = undefined;

    return sendSuccess(res, { user, token }, 200, 'Logged in');
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, { user: req.user });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, getMe };
