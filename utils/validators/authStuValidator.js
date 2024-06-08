const { check } = require("express-validator");
const student = require("../../models/studentModel");
const validatorMiddleWare = require("../../middleWares/validatorMiddleware");

exports.signupValidator =[
  //rules
  check("name")
  .notEmpty().withMessage('NAME IS REQUIRED')
  .isLength({min :3}).withMessage('TO SHORT User NAME'),
  check("programme")
  .notEmpty().withMessage('programme IS REQUIRED'),
  check("courses").notEmpty().withMessage('courses IS REQUIRED'),

  check("email")
  .notEmpty().withMessage('Email IS REQUIRED')
  .isEmail().withMessage('Invalid Email Address')
  .custom((val)=> student.findOne({email : val}).then((student) =>{
      if(student){
          return Promise.reject(new Error('Email already user'))
      }
  })
  ),

  
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

  check("profileImage").optional(),

  
  //miidleware
  validatorMiddleWare,
];
exports.loginValidator =[
    //rules
    
  
    check("email")
    .notEmpty().withMessage('Email IS REQUIRED')
    .isEmail().withMessage('Invalid Email Address'),
    
  
    
    check("password")
    .notEmpty().withMessage('password IS REQUIRED')
    .isLength({min : 6}).withMessage('Password must be at least 6'),
    
  
    
  
    
  
    
    //miidleware
    validatorMiddleWare,
  ];
  