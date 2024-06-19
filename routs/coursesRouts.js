const express = require('express');

const authServicesForLec = require('../controller/authServicesForLec');

const {
  createCourses,
  getAllCourses,
  getCourses,
  deleteSpecificCourses,
  updateSpecificCourses,
  searchForCourses,
  coursesForOneOnDay
} = require('../controller/coursesServices');
const {
  createCoursesValidator,
  getCoursesValidator,
  updateCoursesValidator,
  deleteCoursesValidator,
} = require('../utils/validators/coursesValidator');

// mergeparams : allow us to access prarmeters onother routers
// const studentRoute = require('./studentRouts');
// const lecturerRoute = require('./lecturerRouts');

//mergeParams: allow us to access parameter on other route
// const router = express.Router({ mergeParams: true });
const router = express.Router();


//router.use("/:coursesId/student", studentRoute);
//router.use("/:coursesId/lecturer", lecturerRoute);

router
  .route('/')
  .post(
    authServicesForLec.protect,
    authServicesForLec.allowedTo('admin', 'manager'),
    createCoursesValidator,
    createCourses
  )
  .get(
    authServicesForLec.protect,
    authServicesForLec.allowedTo('admin', 'manager', 'user'),
    getAllCourses
  );

router
  .route('/:id')
  .get(
    authServicesForLec.protect,
    authServicesForLec.allowedTo('admin', 'manager', 'user'),
    getCoursesValidator,
    getCourses
  )
  .put(
    authServicesForLec.protect,
    authServicesForLec.allowedTo('admin', 'manager'),
    updateCoursesValidator,
    updateSpecificCourses
  )
  .delete(
    authServicesForLec.protect,
    authServicesForLec.allowedTo('admin', 'manager'),
    deleteCoursesValidator,
    deleteSpecificCourses
  );

router
  .route('/search/:keyword')
  .get(
    authServicesForLec.protect,
    authServicesForLec.allowedTo('admin', 'manager'),
    searchForCourses
  );
  router
  .route('/:id/:lectureDay')
  .get(
    authServicesForLec.protect,
    authServicesForLec.allowedTo('admin', 'manager'),
  coursesForOneOnDay
  );

module.exports = router;
