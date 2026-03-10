const express = require('express');
const { body } = require('express-validator');
const { createSession, joinSession } = require('../controllers/sessionController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/',
  authenticate,
  authorize('mentor'),
  [
    body('lessonId').notEmpty().isMongoId().withMessage('Valid lessonId is required'),
    body('date').notEmpty().isISO8601().withMessage('A valid date is required'),
    body('topic').trim().notEmpty().withMessage('Topic is required'),
    body('summary').optional().trim(),
  ],
  validate,
  createSession
);

router.post(
  '/:id/join',
  authenticate,
  authorize('parent'),
  [
    body('studentId').notEmpty().isMongoId().withMessage('Valid studentId is required'),
  ],
  validate,
  joinSession
);

module.exports = router;
