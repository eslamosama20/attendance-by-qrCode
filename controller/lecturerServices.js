const lecturerModel = require("../models/lecturerModel");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const factory = require("./factoryHandlers");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const coursesModel = require("../models/coursesModel");

const createToken = (payload) =>
  jwt.sign({ lecturerId: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const { uploadSingleImage } = require("../middleWares/uploadImageMiddleware");

//upload single image
exports.uploadLecturerImage = uploadSingleImage("profileImage");
//image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `lecturer-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/Students/lecturers/${filename}`);

    //save image into our db
    req.body.profileImage = filename;
  }
  next();
});

exports.setCoursesIDToBody = (req, res, next) => {
  if (!req.body.courses) req.body.courses = req.params.coursesId;
  next();
};
exports.createFilterObj = (req, res, next) => {
  let filterObj = {};
  if (req.params.coursesId) filterObj = { courses: req.params.coursesId };
  req.filterObj = filterObj;
  next();
};

// @desc get all students
// @route /api/v1/students
// @ access public
exports.getAllLecturer = asyncHandler(async (req, res) => {
  const countDocuments = await lecturerModel.countDocuments();
  const apiFeatures = new ApiFeatures(lecturerModel.find(), req.query)
    .paginate(countDocuments)
    .filter()
    .limitFields()
    .sort();
  //execute query
  const { mongooseQuery, paginationResult } = apiFeatures;
  const lecturers = await mongooseQuery;
  res.status(200).json({
    results: lecturers.length,
    paginationResult,
    status: "success",
    data: lecturers,
  });
});
// @desc create student
// @route /api/v1/student
// @ access private
exports.createLecturer = factory.createOne(lecturerModel);
// @desc get specificBy id lecturer
// @route /api/v1/lecturer/:id
// @ access public
exports.getLecturer = factory.getOne(lecturerModel);


exports.updateSpecificLecturer = factory.updateOne(lecturerModel);

// @desc delete specificBy id student
// @route /api/v1/student/:id
// @ access private
exports.deleteSpecificLecturer = factory.deleteOne(lecturerModel);

exports.searchForLecturer = factory.search(lecturerModel);
exports.changeLecturerPassword = asyncHandler(async (req, res, next) => {
  const doc = await lecturerModel.findByIdAndDelete(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!doc) {
    return next(new ApiError(`No doc for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: doc });
});

// @desc    Get Logged lecturer data
// @route   GET /api/v1/lecturer/getMe
// @access  Private/Protect
exports.getLoggedLecData = asyncHandler(async (req, res, next) => {
  req.params.id = req.lecturer._id;
  next();
});

// @desc    Update logged lecturer data (without password, role)
// @route   PUT /api/v1/lecturer/updateMe
// @access  Private/Protect
exports.updateLoggedLecData = asyncHandler(async (req, res, next) => {
  const lecturer = await lecturerModel.findByIdAndUpdate(
    req.lecturer._id,
    {
      email: req.body.email,
      name: req.body.name,
      phone: req.body.phone,
      profileImage: req.body.profileImage,
    },
    {
      new: true,
    }
  );

  res.status(200).json({ data: lecturer });
});

// @desc    Update logged Lec password
// @route   PUT /api/v1/lecturer/updateMyPassword
// @access  Private/Protect
exports.updateLoggedLecPassword = asyncHandler(async (req, res, next) => {
  // 1) Update lecturer password based user payload (req.lecturer._id)
  const lecturer = await lecturerModel.findByIdAndUpdate(
    req.lecturer._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  // 2) Generate token
  const token = createToken(lecturer._id);

  res.status(200).json({ data: lecturer, token });
});

// @desc    Deactivate logged lecturer
// @route   DELETE /api/v1/lecturer/deleteMe
// @access  Private/Protect
exports.deleteLoggedLecData = asyncHandler(async (req, res, next) => {
  await lecturerModel.findByIdAndUpdate(req.lecturer._id, { active: false });

  res.status(204).json({ status: "Success" });
});

exports.getCoursesForLecturer = asyncHandler(async (req, res) => {
  const lecturerId = req.params.id;

  // استرجاع الكورسات المرتبطة بمعرف الدكتور
  const courses = await coursesModel
    .find({ lecturerId: lecturerId }) // البحث عن الكورسات التي تحتوي على lecturerId

  res.status(200).json({
    success: true,
    data: courses,
  });
});
