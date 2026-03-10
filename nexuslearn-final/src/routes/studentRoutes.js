const express = require('express');
const { body } = require('express-validator');
const { createStudent, getStudents } = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(authenticate, authorize('parent'));

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('age').optional().isInt({ min: 1, max: 100 }).withMessage('Age must be a number between 1 and 100'),
  ],
  validate,
  createStudent
);

router.get('/', getStudents);

module.exports = router;
