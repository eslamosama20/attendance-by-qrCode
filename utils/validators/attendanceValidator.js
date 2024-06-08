const {check} = require('express-validator');
const validatorMiddleWare=require('../../middleWares/validatorMiddleware');
const attendance = require("../../models/attendanceModel");

exports.getAttendanceValidator=[
check('id')
.isMongoId()
.withMessage('invalid attendance id'),
validatorMiddleWare,
]
exports.createAttendanceValidator =[
    //rules
    check("courseCode")
    .notEmpty().withMessage('courseCode IS REQUIRED'),
    //.isLength({min :3}).withMessage('TO SHORT User NAME'),
    check("courseId").notEmpty().withMessage('courseId IS REQUIRED'),  
    check("studentId").isMongoId().withMessage("studentId user id"),  
    
    
    //miidleware
    validatorMiddleWare,
  ];
  
  exports.updateAttendanceValidator = [
    check("id").isMongoId().withMessage("invalid user id"),
    
    validatorMiddleWare,
  ];  
   exports.deleteAttendanceValidator = [
    check("id").isMongoId().withMessage("invalid user id"),
    validatorMiddleWare,
  ];
  