const Booking = require('../models/Booking');
const Student = require('../models/Student');
const Lesson = require('../models/Lesson');
const { sendSuccess, sendError } = require('../utils/response');

const createBooking = async (req, res, next) => {
  try {
    const { studentId, lessonId } = req.body;

    const student = await Student.findOne({ _id: studentId, parentId: req.user._id });
    if (!student) {
      return sendError(res, 'Student not found or does not belong to you', 404);
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return sendError(res, 'Lesson not found', 404);
    }

    const alreadyBooked = await Booking.findOne({ studentId, lessonId });
    if (alreadyBooked) {
      return sendError(res, 'Student is already booked for this lesson', 409);
    }

    const booking = await Booking.create({
      studentId,
      lessonId,
      bookedBy: req.user._id,
    });

    await booking.populate([
      { path: 'studentId', select: 'name email' },
      { path: 'lessonId', select: 'title description' },
    ]);

    return sendSuccess(res, { booking }, 201, 'Booking created');
  } catch (err) {
    next(err);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const myStudents = await Student.find({ parentId: req.user._id }).select('_id');
    const ids = myStudents.map((s) => s._id);

    const bookings = await Booking.find({ studentId: { $in: ids } })
      .populate('studentId', 'name email')
      .populate('lessonId', 'title description')
      .sort({ createdAt: -1 });

    return sendSuccess(res, { bookings, count: bookings.length });
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, getBookings };
