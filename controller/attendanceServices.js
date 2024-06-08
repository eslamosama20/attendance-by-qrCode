const attendanceModel = require("../models/attendanceModel");
const asyncHandler = require("express-async-handler");
const apiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const factory = require("./factoryHandlers");




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
exports.getAttendance = asyncHandler(async (req, res) => {
  const countDocuments = await attendanceModel.countDocuments();
  const apiFeatures = new ApiFeatures(attendanceModel.find(), req.query)
    .paginate(countDocuments)
    .filter()
    .limitFields()
    .sort();
  //execute query
  const { mongooseQuery, paginationResult } = apiFeatures;
  const attendance = await mongooseQuery;

  res.status(200).json({
    results: attendance.length,
    status: "success",
    paginationResult,
    data: attendance,
  });
});
// @desc create student
// @route /api/v1/student
// @ access private
exports.createAttendance = factory.createOne(attendanceModel);
// @desc get specificBy id student
// @route /api/v1/student/:id
// @ access public
exports.getoneAttendance = factory.getOne(attendanceModel);
// @desc get specificBy id student to view his courses
// @route /api/v1/studentcourses/:id
// @ access public


exports.updateSpecificattendance = factory.updateOne(attendanceModel);
// @desc delete specificBy id student
// @route /api/v1/student/:id
// @ access private
exports.deleteSpecificattendance = factory.deleteOne(attendanceModel);



