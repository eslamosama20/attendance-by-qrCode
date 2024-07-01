const express = require("express");
const authServicesForLec = require("../controller/authServicesForLec");
const authServicesForStudent = require("./../controller/authServicesForStu");

const {
  getAttendanceValidator,
  createAttendanceValidator,
  updateAttendanceValidator,
  deleteAttendanceValidator,
} = require("../utils/validators/attendanceValidator");

const {
  takeAttendance,
  scan,
  getCourseAttendance,
  getLectureAttendance,
  getStudentAttendanceInCourse,

  
} = require("../controller/attendanceServices");

const router = express.Router({ mergeParams: true });

///////////////////////////////////////  my routes 😜  /////////////////////////////////////////////////////////////

// 1) take attendance route
router.post(
  "/takeAttendance/:courseId/:lectureId",
  // authServicesForLec.protect,
  // authServicesForLec.allowedTo("manager"),
  takeAttendance
);



// 2) get course attendance :

router.post(
  "/viewCourseAttendance/:courseId",
  authServicesForLec.protect,
  authServicesForLec.allowedTo("manager"),
  getCourseAttendance
);

// 3) get lecture attendance

router.post(
  "/viewLectureAttendance/:lectureId",
  authServicesForLec.protect,
  authServicesForLec.allowedTo("manager"),
  getLectureAttendance
);

// 4) scan qr code for students only

router.post(
  "/scan",
  authServicesForStudent.protect,
  authServicesForStudent.allowedTo("student"),
  scan
);

// 5) get student attendance in specific course 'used by students only'

router.get(
  "/getStudentAttendance/:courseId",
  authServicesForStudent.protect,
  authServicesForStudent.allowedTo("student"),
  getStudentAttendanceInCourse
);


module.exports = router;
