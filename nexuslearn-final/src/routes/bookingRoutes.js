const express = require('express');
const { body } = require('express-validator');
const { createBooking, getBookings } = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authenticate, authorize('parent'));

router.post(
  '/',
  [
    body('studentId').notEmpty().isMongoId().withMessage('Valid studentId is required'),
    body('lessonId').notEmpty().isMongoId().withMessage('Valid lessonId is required'),
  ],
  validate,
  createBooking
);

router.get('/', getBookings);

module.exports = router;
