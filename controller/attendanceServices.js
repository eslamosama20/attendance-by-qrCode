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
  const expirationTime = Date.now() + 10000; // 10 ثوانٍ بالمللي ثانية


  const qrData = `${courseId}${lectureId}${expirationTime}`;
  const qrCode = await qrGenerator(qrData);
  

  // sending response to the client
  res.status(201).json({
    status: 'success',
    data: {
      qrCode,
    }
  });
  

});



// 2) scan qr

exports.scan = catchAsync(async (req, res, next) => {
  // student must be authenticated to use this endpoint :
  const { qrData } = req.body;
  const studentId = req.student._id;
  const expirationTime = parseInt(qrData.slice(-13)); // افتراض أن الوقت في النهاية
  const currentTimestamp = Date.now();

  // التحقق مما إذا كان الوقت المحفوظ مع الـ QR code قد انتهى
  if (currentTimestamp > expirationTime) {
    return next(
      new apiError('انتهت صلاحية رمز الاستجابة السريعة', 400)
    );
  }
  const qrDataWithoutExpiration = qrData.slice(0, -13);

  const attendanceToken = `${qrDataWithoutExpiration}${studentId}`;

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

exports.getStudentAttendanceInCourse = asyncHandler(async (req, res, next) => {
  const { courseId } = req.params;
  const studentId = req.student._id;

  // احصل على الكورس المحدد وتحقق من وجوده
  const course = await Course.findById(courseId).populate('lectures');
  if (!course) {
    return res.status(404).json({
      status: 'fail',
      message: 'Course not found',
    });
  }

  // احصل على حالة حضور الطالب لكل محاضرة
  const attendanceRecords = await Attendance.find({
    courseId,
    studentId,
  }).select('lectureNumber status');

  // إنشاء خريطة لحالة حضور الطالب لكل محاضرة
  const attendanceMap = {};
  attendanceRecords.forEach(record => {
    attendanceMap[record.lectureNumber] = record.status;
  });

  // إنشاء النتيجة النهائية
  const studentAttendance = course.lectures.map(lecture => ({
    lectureNumber: lecture.lectureNumber,
    status: attendanceMap[lecture.lectureNumber] || 'Absent', // تعيين الحالة إلى 'Absent' إذا لم يكن هناك سجل
  }));

  // حساب نسبة الحضور
  const totalLectures = course.lectures.length;
  const attendedLectures = studentAttendance.filter(att => att.status === 'present').length;
  const attendancePercentage = (attendedLectures / totalLectures) * 100;

  res.status(200).json({
    status: 'success',
    data: {
      studentAttendance,
      attendancePercentage: attendancePercentage.toFixed(2), // لتنسيق النسبة إلى رقم عشري ثابت
    },
  });
});
