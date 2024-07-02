const { check } = require('express-validator');
const validatorMiddleWare = require('../../middleWares/validatorMiddleware');
const student = require('../../models/studentModel');
const bcrypt = require('bcryptjs');

exports.getStudentValidator = [
  check('id').isMongoId().withMessage('invalid category id'),
  validatorMiddleWare,
];
exports.createStudentValidator = [
  //rules
  check('name')
    .notEmpty()
    .withMessage('NAME IS REQUIRED')
    .isLength({ min: 3 })
    .withMessage('TO SHORT User NAME'),
  check('programme').notEmpty().withMessage('programme IS REQUIRED'),
  check('courses').notEmpty().withMessage('courses IS REQUIRED'),
  check('level').notEmpty().withMessage('level IS REQUIRED'),

  check('email')
    .notEmpty()
    .withMessage('Email IS REQUIRED')
    .isEmail()
    .withMessage('Invalid Email Address')
    .custom((val) =>
      student.findOne({ email: val }).then((user) => {
        if (user) {
          return Promise.reject(new Error('Email already used'));
        }
      })
    ),

  check('phone')
    .optional()
    .isMobilePhone('ar-EG')
    .withMessage('invalid mobile phone only accepted EGy'),

  check('password')
    .notEmpty()
    .withMessage('password IS REQUIRED')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6')
    .custom((password, { req }) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error('passwordConfirm inCorrect');
      }
      return true;
    }),

  check('passwordConfirm')
    .notEmpty()
    .withMessage('passwordConfirm IS REQUIRED'),

  check('profileImage').optional(),

  check('role').optional(),

  //miidleware
  validatorMiddleWare,
];

exports.updateStudentValidator = [
  check('id').isMongoId().withMessage('invalid user id'),

  check('email')
    .optional()
    // .notEmpty()
    // .withMessage("Email required")
    .isEmail()
    .withMessage('Invalid email address')
    .custom((val) =>
      student.findOne({ email: val }).then((student) => {
        if (student) {
          return Promise.reject('E-mail already in use');
        }
      })
    ),

  check('phone')
    .optional()
    .isMobilePhone('ar-EG')
    .withMessage('Invalid phone number only accepted Egy Phone numbers'),

  check('profileImage').optional(),
  check('role').optional(),
  validatorMiddleWare,
];
exports.deleteStudentValidator = [
  check('id').isMongoId().withMessage('invalid user id'),
  validatorMiddleWare,
];
exports.changeStudentPasswordValidator = [
  // check('currentPassword')
  //   .notEmpty()
  //   .withMessage('you must enter currentPassword'),

  check('confirmPassword')
    .notEmpty()
    .withMessage('you must enter confirmPassword'),

  check('password')
    .notEmpty()
    .withMessage('you must enter new Password')
    .custom(async (val, { req }) => {
      try {
        // 1) Verify current password
        const studentInstance = await student.findById(req.params.id); // Check this line
        if (!studentInstance) {
          throw new Error('There is no user for the provided id');
        }

        // const isCorrect = await bcrypt.compare(
        //   req.body.currentPassword,
        //   studentInstance.password
        // );
        // if (!isCorrect) {
        //   throw new Error('Incorrect Current Password');
        // }

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

exports.changeLoggedStuValidator = [
  check('currentPassword')
    .notEmpty()
    .withMessage('you must enter currentPassword'),

  check('confirmPassword')
    .notEmpty()
    .withMessage('you must enter confirmPassword'),

  check('password')
    .notEmpty()
    .withMessage('you must enter new Password')
    .custom(async (val, { req }) => {
      try {
        // 1) Verify current password
        const studenttInstance = await student.findById(req.student._id); // Check this line
        if (!studenttInstance) {
          throw new Error('There is no user for the provided id');
        }

        const isCorrect = await bcrypt.compare(
          req.body.currentPassword,
          studenttInstance.password
        );
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

exports.updateLoggedStuDataValidator = [
  check('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email address')
    .custom((val) =>
      student.findOne({ email: val }).then((student) => {
        if (student) {
          return Promise.reject('E-mail already in use');
        }
      })
    ),
  check('phone')
    .optional()
    .isMobilePhone('ar-EG')
    .withMessage('Invalid phone number only accepted Egy Phone numbers'),

  check('profileImage').optional(),

  validatorMiddleWare,
];
