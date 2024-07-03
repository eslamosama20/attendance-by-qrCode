const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const student = require("../models/studentModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const sendEmail = require("../utils/sendEmailStu");
const createToken = (payload) =>
  jwt.sign({ studentId: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

exports.signup = asyncHandler(async (req, res, next) => {
  // 1) create student
  const foundStudent = await student.create(req.body);
  // 2) generate jwt (token)
  const token = createToken(foundStudent._id);
  res.status(201).json({ data: foundStudent, token });
});

exports.login = asyncHandler(async (req, res, next) => {
  const foundStudent = await student.findOne({ email: req.body.email });
  if (
    !foundStudent ||
    !(await bcrypt.compare(req.body.password, foundStudent.password))
  ) {
    return next(new ApiError("Invalid email or password", 401));
  }
  // genrate token
  const token = createToken(foundStudent._id);
  // send response to client
  res.status(200).json({ data: foundStudent, token });
});

// @desc   make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Check if token exist, if exist get
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(
      new ApiError(
        "You are not login, Please login to get access this route",
        401
      )
    );
  }

  // 2) Verify token (no change happens, expired token)
  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  console.log(decoded);
  // 3) Check if user exists
  const currentStudent = await student.findById(decoded.studentId);
  if (!currentStudent) {
    return next(
      new ApiError(
        "The user that belong to this token does no longer exist",
        401
      )
    );
  }
  // 4)check if user change password after the token was issued
  if (currentStudent.passwordChangedAt) {
    const passChangedTimesTAmp = parseInt(
      currentStudent.passwordChangedAt.getTime() / 1000,
      10
    );
    if (passChangedTimesTAmp > decoded.iat) {
      return next(
        new ApiError(
          "user recently changed his pssword ,please login again.. ",
          401
        )
      );
    }
  }
  req.student = currentStudent;
  next();
});

exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1)access rule
    // 2)access registred user(req.user.role)
    if (!roles.includes(req.student.role)) {
      return next(
        new ApiError("you are not allowed to access this route", 403)
      );
    }
    next();
  });

exports.forgetPassword = asyncHandler(async (req, res, next) => {
  // get user by email
  const foundStudent = await student.findOne({ email: req.body.email });
  if (!foundStudent) {
    return next(
      new ApiError(`there is not user with this email : ${req.body.email}`, 404)
    );
  }
  // if user exist, generate  Hash rondom 6 digits and send it to db
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const HashedRestCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  // console.log(resetCode);
  // console.log(HashedRestCode);

  // Save hashed password reset code into db
  foundStudent.passwordRessetCode = HashedRestCode;
  // Add expiration time for password reset code (10 min)
  foundStudent.passwordRessetExpires = Date.now() + 10 * 60 * 1000;
  foundStudent.passwordResetVerified = false;

  await foundStudent.save();

  // 3) Send the reset code via email
  const message = `Hi ${foundStudent.name},\n We received a request to reset the password on your Attendenceapp Account. \n ${resetCode} \n Enter this code to complete the reset. \n Thanks for helping us keep your account secure.\n The E-shop Team`;
  try {
    await sendEmail({
      email: foundStudent.email,
      subject: "Your password reset code (valid for 10 min)",
      message,
    });
  } catch (err) {
    foundLecturer.passwordRessetCode = undefined;
    foundLecturer.passwordRessetExpires = undefined;
    foundLecturer.passwordResetVerified = undefined;
    await foundLecturer.save();
    return next(new ApiError("There is an error in sending email", 500));
  }

  res
    .status(200)
    .json({ status: "Success", message: "Reset code sent to email" });
});

// @desc    Verify password reset code
// @route   POST /api/v1/auth/verifyResetCode
// @access  Public
exports.verifyPassResetCode = asyncHandler(async (req, res, next) => {
  // 1) Get user based on reset code
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const foundStudent = await student.findOne({
    passwordRessetCode: hashedResetCode,
    passwordRessetExpires: { $gt: Date.now() },
  });
  if (!foundStudent) {
    return next(new ApiError("Reset code invalid or expired"));
  }

  // 2) Reset code valid
  foundStudent.passwordResetVerified = true;
  await foundStudent.save();

  res.status(200).json({
    status: "Success",
  });
});

// @desc    Reset password
// @route   POST /api/v1/auth/resetPassword
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1) Get user based on email
  const foundStudent = await student.findOne({ email: req.body.email });
  if (!foundStudent) {
    return next(
      new ApiError(`There is no foundStudent with email ${req.body.email}`, 404)
    );
  }

  // 2) Check if reset code verified
  if (!foundStudent.passwordResetVerified) {
    return next(new ApiError("Reset code not verified", 400));
  }

  foundStudent.password = req.body.newPassword;
  foundStudent.passwordRessetCode = undefined;
  foundStudent.passwordRessetExpires = undefined;
  foundStudent.passwordResetVerified = undefined;

  await foundStudent.save();

  // 3) if everything is ok, generate token
  const token = createToken(foundStudent._id);
  res.status(200).json({ token });
});
