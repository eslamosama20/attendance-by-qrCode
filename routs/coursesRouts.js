const express = require('express');

const authServicesForLec = require('../controller/authServicesForLec');
const authServicesForStu = require('../controller/authServicesForStu');


const {
  createCourses,
  getAllCourses,
  getCourses,
  deleteSpecificCourses,
  updateSpecificCourses,
  searchForCourses,
  coursesForOneOnDay,
  
  
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
    authServicesForLec.allowedTo('admin'),
    getAllCourses
  )
  router
  .route('/studentView')
  .get(
    authServicesForStu.protect,
    authServicesForStu.allowedTo("student"),
    getAllCourses
  )
    

router
  .route('/:id')
  .get(
    authServicesForLec.protect,
    authServicesForLec.allowedTo('admin', 'manager'),
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
    authServicesForLec.allowedTo('admin'),
    deleteCoursesValidator,
    deleteSpecificCourses
  );

router
  .route('/search/:keyword')
  .get(
    authServicesForLec.protect,
    authServicesForLec.allowedTo('admin'),
    searchForCourses
  );
  router
  .route('/:id/:lectureDay')
  .get(
    authServicesForLec.protect,
    authServicesForLec.allowedTo('manager'),
  coursesForOneOnDay
  );
  router.get('/:id/lectures', async (req, res) => {
    try {
      const courseId = req.params.id; // استخراج معرف الكورس من معلمة الطريق
      if (!courseId) {
        return res.status(400).json({
          status: 'fail',
          message: 'Course ID parameter is required',
        });
      }
  
      const lectures = await courseService.getLecturesByCourseId(courseId); // استخدام خدمة للحصول على المحاضرات
      res.status(200).json({
        status: 'success',
        data: lectures,
      });
    } catch (error) {
      res.status(400).json({
        status: 'fail',
        message: error.message,
      });
    }
  });
  

module.exports = router;
