const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema({
  lectureTitle: {
    type: String,
    required: true,
    trim: true,
  },
  lectureNumber: {
    type: Number,
    required: true,
  },
  course: {
    type: mongoose.Types.ObjectId,
    ref: 'course',
  },
  attendanceRecorded: Boolean,
});

const Lecture = mongoose.model('Lecture', lectureSchema);
module.exports = Lecture;
