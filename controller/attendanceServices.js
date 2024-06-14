const attendanceModel = require('../models/attendanceModel');
const asyncHandler = require('express-async-handler');
const apiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');
const factory = require('./factoryHandlers');
const catchAsync = require('./../utils/catchAsync');
const Student = require('./../models/studentModel');
const Course = require('./../models/coursesModel');
const Attendance = require('./../models/attendanceModel');
const Lecture = require('./../models/lectureModel');
const qrGenerator = require('./../utils/qrCodeGenerator');
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
    status: 'success',
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

//////////////////////////////////////// attendance controllers 😜 ///////////////////////////////////////////////

// 1) take attendance :

exports.takeAttendance = catchAsync(async (req, res, next) => {
  const { lectureId, courseId } = req.params;
  const students = await Student.find({ courses: courseId });
  const lecture = await Lecture.findById(lectureId);

  if (!lecture.attendanceRecorded) {
    lecture.attendanceRecorded = true;
    await lecture.save();

    const attendanceRecords = students.map((student) => ({
      lectureId,
      lectureNumber: lecture.lectureNumber,
      studentId: student._id,
      courseId,
      studentName: student.name,
      attendanceToken: `${courseId}${lectureId}${student._id}`,
      status: 'absent', // default status
    }));

    await Attendance.insertMany(attendanceRecords);
  }

  // generate qr code  :

  // const qrData = `${courseId}${lectureId}`;
  // const qrCode = await qrGenerator(qrData);

  // sending response to the client
  res.status(201).json({
    status: 'success',
    message: 'you can display qr code for students now',
    // data: {
    //   qrCode,
    // },
  });
});

// 2) scan qr

exports.scan = catchAsync(async (req, res, next) => {
  // student must be authenticated to use this endpoint :
  const { qrData } = req.body;
  const studentId = req.student._id;
  const attendanceToken = `${qrData}${studentId}`;

  const attendanceRecord = await Attendance.findOne({ attendanceToken });
  if (!attendanceRecord) {
    return next(
      new apiError('you can not record your attendance for this course', 400)
    );
  }

  if (attendanceRecord.status === 'present') {
    return next(
      new apiError(
        'Your attendance has already been registered for this lecture',
        400
      )
    );
  }

  // mark student as present :
  attendanceRecord.status = 'present';
  await attendanceRecord.save();

  res.status(200).json({
    status: 'success',
    message: 'your attendance recorded successfully',
  });
});

// 3) get course attendance

exports.getCourseAttendance = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;

  const attendanceRecords = await Attendance.find({ courseId });

  if (!attendanceRecords.length) {
    return next(new apiError('No attendance recorded for this course', 404));
  }

  const studentAttendance = {};

  attendanceRecords.forEach((record) => {
    if (!studentAttendance[record.studentId]) {
      studentAttendance[record.studentId] = {
        studentName: record.studentName,
        totalLectures: 0,
        attendedLectures: 0,
        lectures: [],
      };
    }
    studentAttendance[record.studentId].totalLectures += 1;
    if (record.status === 'present') {
      studentAttendance[record.studentId].attendedLectures += 1;
    }
    studentAttendance[record.studentId].lectures.push({
      lectureNumber: record.lectureNumber,
      status: record.status,
    });
  });

  // Format the response data
  const formattedRecords = Object.values(studentAttendance).map((student) => ({
    studentName: student.studentName,
    totalLectures: student.totalLectures,
    attendedLectures: student.attendedLectures,
    attendancePercentage: (
      (student.attendedLectures / student.totalLectures) *
      100
    ).toFixed(2),
    lectures: student.lectures,
  }));

  res.status(200).json({
    message: 'Attendance records retrieved successfully',
    data: formattedRecords,
  });
});

// 4) get lecture attendance
exports.getLectureAttendance = catchAsync(async (req, res, next) => {
  const { lectureId } = req.params;
  const attendances = await Attendance.find({ lectureId }).select(
    'studentName status'
  );

  res.status(200).json({
    status: 'success',
    data: {
      attendances,
    },
  });
});

// 5) get student attendance in specific course :

exports.getStudentAttendanceInCourse = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const studentId = req.student._id;
  const studentAttendance = await Attendance.find({
    courseId,
    studentId,
  }).select('lectureNumber status');
  res.status(200).json({
    status: 'success',
    data: {
      studentAttendance,
    },
  });
});
