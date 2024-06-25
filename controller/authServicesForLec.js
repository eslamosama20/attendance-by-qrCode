const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const lecturer = require('../models/lecturerModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const sendEmail = require('../utils/sendEmailLec');

const createToken = (payload) =>
  jwt.sign({ lecturerId: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

exports.signup = asyncHandler(async (req, res, next) => {
  //1) create lecturer
  const foundLecturer = await lecturer.create(req.body);
  // generate jwt (token)
  const token = createToken(foundLecturer._id);
  res.status(201).json({ data: foundLecturer, token });
});

exports.login = asyncHandler(async (req, res, next) => {
  // check if password and email in the body
  // check if password and email are correct
  const foundLecturer = await lecturer.findOne({ email: req.body.email });
  if (
    !foundLecturer ||
    !(await bcrypt.compare(req.body.password, foundLecturer.password))
  ) {
    return next(new ApiError('Invalid email or password', 401));
  }
  // genrate token
  const token = createToken(foundLecturer._id);
  // send response to client
  res.status(200).json({ data: foundLecturer, token });
});


// @desc   make sure the lecturer is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Check if token exist, if exist get
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new ApiError(
        'You are not login, Please login to get access this route',
        401
      )
    );
  }

  // 2) Verify token (no change happens, expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  console.log(decoded);

  // 3) Check if user exists
  const currentLecturer = await lecturer.findById(decoded.lecturerId);
  if (!currentLecturer) {
    return next(
      new ApiError(
        'The lecturer that belong to this token does no longer exist',
        401
      )
    );
  }
  // 4)check if lecturer change password after the token was issued
  if (currentLecturer.passwordChangedAt) {
    const passChangedTimesTAmp = parseInt(
      currentLecturer.passwordChangedAt.getTime() / 1000,
      10
    );
    if (passChangedTimesTAmp > decoded.iat) {
      return next(
        new ApiError(
          'user recently changed his pssword ,please login again.. ',
          401
        )
      );
    }
  }
  req.lecturer = currentLecturer;
  next();
});

// @ desc Authorization (lecturers permission)
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1)access rule
    // 2)access registred lec(req.lecturer.role)
    if (!roles.includes(req.lecturer.role)) {
      return next(
        new ApiError('you are not allowed to access this route', 403)
      );
    }
    next();
  });


exports.forgetPassword = asyncHandler(async (req, res, next) => {
  // get lecturer by email
  const foundLecturer = await lecturer.findOne({ email: req.body.email });
  if (!foundLecturer) {
    return next(
      new ApiError(
        `there is not lecurer with this email : ${req.body.email}`,
        404
      )
    );
  }
  // if lecturer exist, generate  Hash rondom 6 digits and send it to db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const HashedRestCode = crypto
    .createHash('sha256')
    .update(resetCode)
    .digest('hex');
  console.log(resetCode);
  console.log(HashedRestCode);

  // Save hashed password reset code into db
  foundLecturer.passwordRessetCode = HashedRestCode;
  // Add expiration time for password reset code (10 min)
  foundLecturer.passwordRessetExpires = Date.now() + 10 * 60 * 1000;
  foundLecturer.passwordResetVerified = false;

  await foundLecturer.save();

  // 3) Send the reset code via email
  const message = `Hi ${foundLecturer.name},\n We received a request to reset the password on your
   Attendence App Account. \n ${resetCode} \n Enter this code to complete the reset. \n 
   Thanks for helping us keep your account secure.\n The E-shop Team`;

  try {
    await sendEmail({
      email: foundLecturer.email,
      subject: 'Your password reset code (valid for 10 min)',
      message,
    });
  } catch (err) {
    foundLecturer.passwordRessetCode = undefined;
    foundLecturer.passwordRessetExpires = undefined;
    foundLecturer.passwordResetVerified = undefined;

    await foundLecturer.save();
    return next(new ApiError('There is an error in sending email', 500));
  }
  res
    .status(200)
    .json({ status: 'Success', message: 'Reset code sent to email' });
});

// @desc    Verify password reset code
// @route   POST /api/v1/authLec/verifyResetCode
// @access  Public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  // 1) Get lecturer based on reset code
  const hashedResetCode = crypto
    .createHash('sha256')
    .update(req.body.resetCode)
    .digest('hex');

  const foundLecturer = await lecturer.findOne({
    passwordRessetCode: hashedResetCode,
    passwordRessetExpires: { $gt: Date.now() },
  });
  if (!foundLecturer) {
    return next(new ApiError('Reset code invalid or expired'));
  }

  // 2) Reset code valid
  foundLecturer.passwordResetVerified = true;
  await foundLecturer.save();

  res.status(200).json({
    status: 'Success',
  });
});

// @desc    Reset password
// @route   POST /api/v1/authLec/resetPassword
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get lecturer based on email
  const foundLecturer = await lecturer.findOne({ email: req.body.email });
  if (!foundLecturer) {
    return next(
      new ApiError(
        `There is no foundLecturer with email ${req.body.email}`,
        404
      )
    );
  }

  // 2) Check if reset code verified
  if (!foundLecturer.passwordResetVerified) {
    return next(new ApiError('Reset code not verified', 400));
  }

  foundLecturer.password = req.body.newPassword;
  foundLecturer.passwordRessetCode = undefined;
  foundLecturer.passwordRessetExpires = undefined;
  foundLecturer.passwordResetVerified = undefined;

  await foundLecturer.save();

  // 3) if everything is ok, generate token
  const token = createToken(foundLecturer._id);
  res.status(200).json({ token });
});
