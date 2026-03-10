const Student = require('../models/Student');
const { sendSuccess, sendError } = require('../utils/response');

const createStudent = async (req, res, next) => {
  try {
    const { name, email, age } = req.body;

    const existing = await Student.findOne({ email });
    if (existing) {
      return sendError(res, 'A student with this email already exists', 409);
    }

    const student = await Student.create({
      name,
      email,
      age,
      parentId: req.user._id,
    });

    return sendSuccess(res, { student }, 201, 'Student created');
  } catch (err) {
    next(err);
  }
};

const getStudents = async (req, res, next) => {
  try {
    const students = await Student.find({ parentId: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, { students, count: students.length });
  } catch (err) {
    next(err);
  }
};

module.exports = { createStudent, getStudents };
