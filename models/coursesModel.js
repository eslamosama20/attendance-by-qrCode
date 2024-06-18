const mongoose = require('mongoose');
// 1-create schema
const coursesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      unique: [true, 'the name must be unique'],
      minLength: [2, 'name must be at least 3 characters'],
      maxLength: [100, 'name is too long'],
    },

    lectureDuration: {
      type: String,
      required: [true, 'lectureDuration is required'],
    },

    level: {
      type: String,
      required: [true, 'level is required'],
    },

    // courseCode : {
    //     type :String,
    // },

    lectureDay: {
      type: String,
      required: [true, 'lectureDay is required'],
      minLength: [3, 'lectureDay must be at least 3 characters'],
      maxLength: [100, 'lectureDay is too long'],
    },
    //
    lectureTime: {
      type: String,
      required: [true, 'lectureTime is required'],
    },

    // A and B =>shopping.com/a-and-b

    lecturerId: {
      type: mongoose.Schema.ObjectId,
      ref: 'lecturer',
      required: [true, 'courses mast belong to a lecturer'],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// adding virtual populate to get all lectures of course

coursesSchema.virtual('lectures', {
  ref: 'Lecture',
  foreignField: 'course',
  localField: '_id',
});

coursesSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'lecturerId',
    select: 'name-_id',
  });
  next();
});

coursesSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'lectures',
  });
  next();
});

// 2-create model
const coursesModel = mongoose.model('course', coursesSchema);
module.exports = coursesModel;
