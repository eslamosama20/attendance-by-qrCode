const studentModel = require('../models/studentModel');
const slugify = require('slugify');
const asyncHandler = require('express-async-handler');
const apiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');
const factory = require('./factoryHandlers');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const createToken = (payload) =>
  jwt.sign({ studentId: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const { uploadSingleImage } = require('../middleWares/uploadImageMiddleware');

//upload single image
exports.uploadStudentImage = uploadSingleImage('profileImage');
//image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `student-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`uploads/Students/${filename}`);

    //save image into our db
    req.body.profileImage = filename;
  }
  next();
});

// exports.setStudentIDToBody=(req,res,next)=>{
//     if(!req.body.student) req.body.student=req.params.studentId
//     next()
// }
// exports.createFilterStuObj=(req, res, next)=>{
//     let filterObj={}
//     if(req.params.studentId) filterObj={student : req.params.studentId}
//     req.filterObj=filterObj
//     next()
// }
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
exports.getAllStudent = asyncHandler(async (req, res) => {
  const countDocuments = await studentModel.countDocuments();
  const apiFeatures = new ApiFeatures(studentModel.find(), req.query)
    .paginate(countDocuments)
    .filter()
    .limitFields()
    .sort();
  //execute query
  const { mongooseQuery, paginationResult } = apiFeatures;
  const students = await mongooseQuery;

  res.status(200).json({
    results: students.length,
    status: 'success',
    paginationResult,
    data: students,
  });
});
// @desc create student
// @route /api/v1/student
// @ access private
exports.createStudent = factory.createOne(studentModel);
// @desc get specificBy id student
// @route /api/v1/student/:id
// @ access public
exports.getStudent = factory.getOne(studentModel);
// @desc get specificBy id student to view his courses
// @route /api/v1/studentcourses/:id
// @ access public
exports.getCoursesForStudent = asyncHandler(async (req, res) => {
  const studentId = req.params.id;

  // التحقق من صحة ObjectId
  

  // استرجاع الطالب باستخدام معرف الطالب
  const student = await studentModel
    .findById(studentId)
    .populate({ path: "courses", select: "name -_id" }); // جلب أسماء الكورسات فقط

  // التحقق مما إذا كان الطالب موجود
  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student not found",
    });
  }

  // جلب أسماء الكورسات فقط
  const courses = student.courses.map(course => ({
    id: course._id,
    name: course.name
  }));

  res.status(200).json({
    success: true,
    data: courses,
  });
});// @desc update specificBy id student
// @route /api/v1/student/:id
// @ access private

exports.updateSpecificStudent = factory.updateOne(studentModel);
// @desc delete specificBy id student
// @route /api/v1/student/:id
// @ access private
exports.deleteSpecificStudent = factory.deleteOne(studentModel);

exports.searchForStudent = factory.search(studentModel);
exports.changeStudentPassword = asyncHandler(async (req, res, next) => {
  const doc = await studentModel.findByIdAndUpdate(
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

// @desc    Get Logged student data
// @route   GET /api/v1/student/getMe
// @access  Private/Protect
exports.getLoggedStuData = asyncHandler(async (req, res, next) => {
  req.params.id = req.student._id;
  next();
});

// @desc    Update logged student password
// @route   PUT /api/v1/student/updateMyPassword
// @access  Private/Protect
exports.updateLoggedStuPassword = asyncHandler(async (req, res, next) => {
  // 1) Update student password based user payload (req.student._id)
  const student = await studentModel.findByIdAndUpdate(
    req.student._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  // 2) Generate token
  const token = createToken(student._id);

  res.status(200).json({ data: student, token });
});

// @desc    Update logged student data (without password, role)
// @route   PUT /api/v1/student/updateMe
// @access  Private/Protect
exports.updateLoggedStuData = asyncHandler(async (req, res, next) => {
  const student = await studentModel.findByIdAndUpdate(
    req.student._id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      profileImage: req.body.profileImage,
    },
    { new: true }
  );

  res.status(200).json({ data: student });
});

// @desc    Deactivate logged student
// @route   DELETE /api/v1/student/deleteMe
// @access  Private/Protect
exports.deleteLoggedStuData = asyncHandler(async (req, res, next) => {
  await studentModel.findByIdAndUpdate(req.student._id, { active: false });

  res.status(204).json({ status: 'Success' });
});
