const express = require('express');
const rateLimit = require('express-rate-limit');
const { summarize } = require('../controllers/llmController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please wait a minute and try again.',
  },
});

router.post('/summarize', authenticate, limiter, summarize);

module.exports = router;
