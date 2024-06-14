const { check } = require('express-validator');
const validatorMiddleWare = require('../../middleWares/validatorMiddleware');
exports.getCoursesValidator = [
  check('id').isMongoId().withMessage('invalid course id'),
  validatorMiddleWare,
];
exports.createCoursesValidator = [
  check('name')
    .notEmpty()
    .withMessage('name is required')
    .isLength({ min: 3 })
    .withMessage('too short course name')
    .isLength({ max: 32 })
    .withMessage('too long course name'),
  check('lecturerId')
    .notEmpty()
    .withMessage('courses mast belong to a lecturer')
    .isMongoId()
    .withMessage('invalid lecturer id'),
  // check("courseCode").optional(),
  validatorMiddleWare,
];
exports.updateCoursesValidator = [
  check('id').isMongoId().withMessage('invalid course id'),
  validatorMiddleWare,
];
exports.deleteCoursesValidator = [
  check('id').isMongoId().withMessage('invalid course id'),
  validatorMiddleWare,
];
