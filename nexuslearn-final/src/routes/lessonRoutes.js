const express = require('express');
const { body } = require('express-validator');
const { createLesson, getLessons, getLessonById } = require('../controllers/lessonController');
const { getSessionsByLesson } = require('../controllers/sessionController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', authenticate, getLessons);
router.get('/:id', authenticate, getLessonById);
router.get('/:id/sessions', authenticate, getSessionsByLesson);

router.post(
  '/',
  authenticate,
  authorize('mentor'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
  ],
  validate,
  createLesson
);

module.exports = router;
