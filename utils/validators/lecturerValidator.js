const {check} = require('express-validator');
const validatorMiddleWare=require('../../middleWares/validatorMiddleware');
const lecturer = require("../../models/lecturerModel");
const bcrypt = require("bcryptjs");

exports.getLecturerValidator=[
check('id')
.isMongoId()
.withMessage('invalid lecturer id'),
validatorMiddleWare,
]
exports.createLecturerValidator =[
    //rules
    check("name")
    .notEmpty().withMessage('NAME IS REQUIRED')
    .isLength({min :3}).withMessage('TO SHORT User NAME'),
    check("programme")
    .notEmpty().withMessage('programme IS REQUIRED'),
  
    check("email")
    .notEmpty().withMessage('Email IS REQUIRED')
    .isEmail().withMessage('Invalid Email Address')
    .custom((val)=> lecturer.findOne({email : val}).then((user) =>{
        if(lecturer){
            return Promise.reject(new Error('Email already user'))
        }
    })
    ),
  
    check("phone")
    .optional()
    .isMobilePhone("ar-EG").withMessage('invalid mobile phone only accepted EGy'),
  
    check("password")
    .notEmpty().withMessage('password IS REQUIRED')
    .isLength({min : 6}).withMessage('Password must be at least 6')
    .custom((password , {req})=>{
        if (password !== req.body.passwordConfirm){
            throw new Error ('passwordConfirm inCorrect')
        }
        return true
    }),
  
    check("passwordConfirm")
    .notEmpty().withMessage('passwordConfirm IS REQUIRED'),
  
    
  
    check("profileImage")
    .optional(),
  
    check("role")
    .optional(),
  
    //miidleware
    validatorMiddleWare,
  ];
  
  exports.updateLecturerValidator = [
    check("id").isMongoId().withMessage("invalid user id"),
    check("email")
      .optional()
      .isEmail()
      .withMessage("Invalid email address")
      .custom((val) =>
      lecturer.findOne({ email: val }).then((lecturer) => {
          if (lecturer) {
            return Promise.reject("E-mail already in use");
          }
        })
      ),
      check("phone")
      .optional()
      .isMobilePhone("ar-EG")
      .withMessage("Invalid phone number only accepted Egy Phone numbers"),
  
    check("profileImage").optional(),
    check("role").optional(),
    validatorMiddleWare,
  ];  
   exports.deleteLecturerValidator = [
    check("id").isMongoId().withMessage("invalid user id"),
    validatorMiddleWare,
  ];
  exports.changeLecturerPasswordValidator = [
    check('currentPassword')
      .notEmpty().withMessage('you must enter currentPassword'),
  
    check('confirmPassword')
      .notEmpty().withMessage('you must enter confirmPassword'),
  
    check('password')
      .notEmpty().withMessage('you must enter new Password')
      .custom(async (val , {req}) => {
        try {
          // 1) Verify current password
          const lecturertInstance = await lecturer.findById(req.params.id); // Check this line
          if (!lecturertInstance) {
            throw new Error('There is no user for the provided id');
          }
  
          const isCorrect = await bcrypt.compare(req.body.currentPassword, lecturertInstance.password);
          if (!isCorrect) {
            throw new Error('Incorrect Current Password');
          }
  
          // 2) Verify confirm password
          if (val !== req.body.confirmPassword) {
            throw new Error('Password confirmation does not match');
          }
  
          return true;
        } catch (error) {
          // Handle any errors here
          throw new Error(error.message);
        }
      }),
    validatorMiddleWare,
  ];

  exports.changeLoggedLecValidator = [
    check('currentPassword')
      .notEmpty().withMessage('you must enter currentPassword'),
  
    check('confirmPassword')
      .notEmpty().withMessage('you must enter confirmPassword'),
  
    check('password')
      .notEmpty().withMessage('you must enter new Password')
      .custom(async (val , {req}) => {
        try {
          // 1) Verify current password
          const lecturertInstance = await lecturer.findById(req.lecturer._id); // Check this line
          if (!lecturertInstance) {
            throw new Error('There is no user for the provided id');
          }
  
          const isCorrect = await bcrypt.compare(req.body.currentPassword, lecturertInstance.password);
          if (!isCorrect) {
            throw new Error('Incorrect Current Password');
          }
  
          // 2) Verify confirm password
          if (val !== req.body.confirmPassword) {
            throw new Error('Password confirmation does not match');
          }
  
          return true;
        } catch (error) {
          // Handle any errors here
          throw new Error(error.message);
        }
      }),
    validatorMiddleWare,
  ];
  

  exports.updateLoggedLecValidator = [
    check("profileImage"),

    check("email")
      .optional()
      .isEmail()
      .withMessage("Invalid email address")
      .custom((val) =>
      lecturer.findOne({ email: val }).then((lecturer) => {
          if (lecturer) {
            return Promise.reject("E-mail already in use");
          }
        })
      ),

      check("phone")
      .optional()
      .isMobilePhone("ar-EG")
      .withMessage("Invalid phone number only accepted Egy Phone numbers"),

    validatorMiddleWare,
  ];

  
