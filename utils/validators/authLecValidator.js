const { check } = require("express-validator");
const lecturer = require("../../models/lecturerModel");
const validatorMiddleWare = require("../../middleWares/validatorMiddleware");

exports.signupValidator =[
  //rules
  check("name")
  .notEmpty().withMessage('NAME IS REQUIRED')
  .isLength({min :3}).withMessage('TO SHORT User NAME'),
  check("programme")
  .notEmpty().withMessage('programme IS REQUIRED'),
  check("email")
    .notEmpty().withMessage('Email IS REQUIRED')
  .isEmail().withMessage('Invalid Email Address')

  .custom((val)=> lecturer.findOne({email : val}).then((lecturer) =>{
      if(lecturer){
          return Promise.reject(new Error('Email already used'))
      }
  })
  ),
  check('courses').optional(),

  
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
  