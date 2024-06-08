const coursesModel = require("../models/coursesModel");
const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const factory = require("./factoryHandlers");

// exports.setStudentIDToBody=(req,res,next)=>{
//     if(!req.body.student) req.body.student=req.params.studentId
//     next()
// }

// exports.createFilterStuObj=(req, res, next)=>{
//         let filterObject={}
//         if(req.params.studentId) filterObject={student : req.params.studentId}
//         req.filterObj=filterObject
//         next()
//     }

exports.createFilterObj = (req, res, next) => {
  let filterObj = {};
  if (req.params.lecturerId) filterObj = { lecturer: req.params.lecturerId };
  req.filterObj = filterObj;
  next();
};

// @desc get all students
// @route /api/v1/students
// @ access public
exports.getAllCourses = asyncHandler(async (req, res) => {
  const countDocuments = await coursesModel.countDocuments();
  const apiFeatures = new ApiFeatures(coursesModel.find(req.filterObj), req.query)
    .paginate()
    //.populate({path:'courses',select:'name -_id'})
    .filter()
    .limitFields()
    .paginate(countDocuments)
    .sort();
  //execute query

  console.log(req.params.lecturerId)
  const { mongooseQuery, paginationResult } = apiFeatures;
  const courses = await mongooseQuery;
  res.status(200).json({
    results: courses.length,
    paginationResult,
    status: "success",
    data: courses,
  });
});
// @desc create student
// @route /api/v1/student
// @ access private
exports.createCourses = factory.createOne(coursesModel);
// @desc get specificBy id student
// @route /api/v1/student/:id
// @ access public
exports.getCourses = factory.getOne(coursesModel);
// @desc update specificBy id student
// @route /api/v1/student/:id
// @ access private

exports.updateSpecificCourses = factory.updateOne(coursesModel);

// @desc delete specificBy id student
// @route /api/v1/student/:id
// @ access private
exports.deleteSpecificCourses = factory.deleteOne(coursesModel);

exports.searchForCourses = factory.search(coursesModel);
