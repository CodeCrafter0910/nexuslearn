const Lesson = require('../models/Lesson');
const { sendSuccess, sendError } = require('../utils/response');

const createLesson = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    const lesson = await Lesson.create({
      title,
      description,
      mentorId: req.user._id,
    });

    await lesson.populate('mentorId', 'name email');

    return sendSuccess(res, { lesson }, 201, 'Lesson created');
  } catch (err) {
    next(err);
  }
};

const getLessons = async (req, res, next) => {
  try {
    const lessons = await Lesson.find()
      .populate('mentorId', 'name email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, { lessons, count: lessons.length });
  } catch (err) {
    next(err);
  }
};

const getLessonById = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('mentorId', 'name email');

    if (!lesson) {
      return sendError(res, 'Lesson not found', 404);
    }

    return sendSuccess(res, { lesson });
  } catch (err) {
    next(err);
  }
};

module.exports = { createLesson, getLessons, getLessonById };
