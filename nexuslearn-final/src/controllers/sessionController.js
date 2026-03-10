const Session = require('../models/Session');
const Lesson = require('../models/Lesson');
const Booking = require('../models/Booking');
const Student = require('../models/Student');
const { sendSuccess, sendError } = require('../utils/response');

const createSession = async (req, res, next) => {
  try {
    const { lessonId, date, topic, summary } = req.body;

    const lesson = await Lesson.findOne({ _id: lessonId, mentorId: req.user._id });
    if (!lesson) {
      return sendError(res, 'Lesson not found or you do not own it', 404);
    }

    const session = await Session.create({ lessonId, date, topic, summary });
    await session.populate('lessonId', 'title');

    return sendSuccess(res, { session }, 201, 'Session created');
  } catch (err) {
    next(err);
  }
};

const getSessionsByLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return sendError(res, 'Lesson not found', 404);
    }

    const sessions = await Session.find({ lessonId: req.params.id })
      .populate('attendees', 'name email')
      .sort({ date: 1 });

    return sendSuccess(res, { sessions, count: sessions.length });
  } catch (err) {
    next(err);
  }
};

const joinSession = async (req, res, next) => {
  try {
    const { studentId } = req.body;

    const session = await Session.findById(req.params.id);
    if (!session) {
      return sendError(res, 'Session not found', 404);
    }

    const student = await Student.findOne({ _id: studentId, parentId: req.user._id });
    if (!student) {
      return sendError(res, 'Student not found or does not belong to you', 404);
    }

    const booked = await Booking.findOne({ studentId, lessonId: session.lessonId });
    if (!booked) {
      return sendError(res, 'Student is not booked for this lesson', 403);
    }

    if (session.attendees.includes(studentId)) {
      return sendError(res, 'Student already joined this session', 409);
    }

    session.attendees.push(studentId);
    await session.save();
    await session.populate('attendees', 'name email');

    return sendSuccess(res, { session }, 200, 'Joined session');
  } catch (err) {
    next(err);
  }
};

module.exports = { createSession, getSessionsByLesson, joinSession };
