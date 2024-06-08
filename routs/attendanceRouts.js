const express = require("express");
const authServicesForLec = require("../controller/authServicesForLec");
const {
  getAttendanceValidator,
  createAttendanceValidator,
  updateAttendanceValidator,
  deleteAttendanceValidator,
  
} = require("../utils/validators/attendanceValidator");

const {
  
  getAttendance,
  createAttendance,
  getoneAttendance,
  updateSpecificattendance,
  deleteSpecificattendance,
  setCoursesIDToBody,
  createFilterObj,
  } = require("../controller/attendanceServices");
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(authServicesForLec.protect,authServicesForLec.allowedTo("admin","manager"),createFilterObj,getAttendance)
  .post(authServicesForLec.protect,authServicesForLec.allowedTo("admin","manager"),setCoursesIDToBody,createAttendanceValidator,createAttendance);
router
  .route("/:id")
  .get(authServicesForLec.protect,authServicesForLec.allowedTo("admin","manager"),getAttendanceValidator, getoneAttendance)
  .put(authServicesForLec.protect,authServicesForLec.allowedTo("admin","manager"),updateAttendanceValidator, updateSpecificattendance)
  .delete(authServicesForLec.protect,authServicesForLec.allowedTo("admin","manager"),deleteAttendanceValidator, deleteSpecificattendance)

module.exports = router;
