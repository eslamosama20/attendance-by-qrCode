const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    lectureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lecture',
      required: true,
    },
    lectureNumber: {
      type: Number,
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'student',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'course',
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent'],
      default: 'absent',
    },
    attendanceToken: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

const AttendanceModel = mongoose.model('Attendance', attendanceSchema);
module.exports = AttendanceModel;
