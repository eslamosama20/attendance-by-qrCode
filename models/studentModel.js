const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1-create schema
const studentSchema = new mongoose.Schema(
  {
    studentid: {
      type: mongoose.Schema.Types.ObjectId,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'name is required'],
      minLength: [3, 'name must be at least 3 characters'],
      maxLength: [100, 'name is too long'],
    },
    email: {
      type: String,
      required: [true, 'email required'],
      unique: true,
      lowercase: true,
    },
    phone: String,
    profileImage: String,
    password: {
      type: String,
      required: [true, 'password required'],
      minlength: [8, 'too short password'],
    },
    passwordChangedAt: Date,
    passwordRessetExpires: Date,
    passwordResetVerified: Boolean,
    passwordRessetCode: String,
    role: {
      type: String,
      enum: ['student'],
      default: 'student',
    },
    active: {
      type: Boolean,
      default: true,
    },
    programme: {
      type: String,
      required: [true, 'programme is required'],
    },
    level: {
      type: String,
    },
    courses: {
      type: [
        {
          type: mongoose.Schema.ObjectId,
          ref: 'course',
        },
      ],
      required: [true, 'courses are required'],
      validate: [arrayLimit, 'courses cannot be empty'],
    },
  },
  { timestamps: true }
);

function arrayLimit(val) {
  return val.length > 0;
}

studentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'courses',
    select: 'name _id',
  });
  next();
});

//return image as URL
const setImageUrl = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/Lecturers/${doc.image}`;
    doc.image = imageUrl;
  }
};
//getAll - getOne - Update
studentSchema.post('init', (doc) => {
  setImageUrl(doc);
});
//create
studentSchema.post('save', (doc) => {
  setImageUrl(doc);
});
studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// 2-create model
const StudentModel = mongoose.model('student', studentSchema);
module.exports = StudentModel;
