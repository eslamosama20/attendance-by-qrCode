const express = require('express');
// const router = express.Router({ mergeParams: true });

const router = express.Router();

const authServicesForLec = require('../controller/authServicesForLec');

const {
  getLecturerValidator,
  createLecturerValidator,
  updateLecturerValidator,
  deleteLecturerValidator,
  changeLecturerPasswordValidator,
  changeLoggedLecValidator,
  updateLoggedLecValidator,
} = require('../utils/validators/lecturerValidator');

const {
  getAllLecturer,
  getCoursesForLecturer,
  createLecturer,
  getLecturer,
  updateSpecificLecturer,
  deleteSpecificLecturer,
  setCoursesIDToBody,
  createFilterObj,
  searchForLecturer,
  uploadLecturerImage,
  resizeImage,
  changeLecturerPassword,
  getLoggedLecData,
  updateLoggedLecPassword,
  updateLoggedLecData,
  deleteLoggedLecData,
} = require('../controller/lecturerServices');

//router.use("/:lecturerId/courses", coursesRoute);

router.get('/lecturer_courses/:id', 
  // authServicesForLec.protect,
  // authServicesForLec.allowedTo('admin',"manager"),
  getLecturerValidator,getCoursesForLecturer);

router.get('/getme', authServicesForLec.protect, getLoggedLecData, getLecturer);
router.put(
  '/changeMyPassword',
  authServicesForLec.protect,
  changeLoggedLecValidator,
  updateLoggedLecPassword
);
router.put(
  '/updateMe',
  authServicesForLec.protect,
  uploadLecturerImage,
  resizeImage,
  updateLoggedLecValidator,
  updateLoggedLecData
);
router.delete('/deleteMe', authServicesForLec.protect, deleteLoggedLecData);

router.put(
  '/changePassword/:id',
  authServicesForLec.protect,
  authServicesForLec.allowedTo('admin'),
  changeLecturerPasswordValidator,
  changeLecturerPassword
);

router
  .route('/')
  .get(
    authServicesForLec.protect,
    authServicesForLec.allowedTo('admin'),
    createFilterObj,
    getAllLecturer
  )
  .post(
    authServicesForLec.protect,
    authServicesForLec.allowedTo('admin'),
    uploadLecturerImage,
    resizeImage,
    setCoursesIDToBody,
    createLecturerValidator,
    createLecturer
  );
router
  .route('/:id')
  .get(
    authServicesForLec.protect,
    authServicesForLec.allowedTo('admin'),
    getLecturerValidator,
    getLecturer
  )
  .put(
    authServicesForLec.protect,
    authServicesForLec.allowedTo('admin'),
    uploadLecturerImage,
    resizeImage,
    updateLecturerValidator,
    updateSpecificLecturer
  )
  .delete(
    authServicesForLec.protect,
    authServicesForLec.allowedTo('admin'),
    deleteLecturerValidator,
    deleteSpecificLecturer
  );
// router
//   .route('/CoursesForLecturer/:id')
//   .get(
//     authServicesForLec.protect,
//     authServicesForLec.allowedTo('admin'),
//     getLecturerValidator,
//     getCoursesForLecturer
//   );

router
  .route('/search/:keyword')
  .get(
    authServicesForLec.protect,
    authServicesForLec.allowedTo('admin'),
    searchForLecturer
  );
module.exports = router;
