const express = require("express");
const authServicesForStu = require("../controller/authServicesForStu");
const authServicesForLec = require("../controller/authServicesForLec");
const coursesRoute=require('./coursesRouts');

const {
  getStudentValidator,
  createStudentValidator,
  updateStudentValidator,
  deleteStudentValidator,
  changeStudentPasswordValidator,
  changeLoggedStuValidator,
  updateLoggedStuDataValidator
} = require("../utils/validators/studentValidator");

const {
  getCoursesForStudent,
  getAllStudent,
  createStudent,
  getStudent,
  updateSpecificStudent,
  deleteSpecificStudent,
  setCoursesIDToBody,
  createFilterObj,
  searchForStudent,
  uploadStudentImage,
  resizeImage,
  changeStudentPassword,
  getLoggedStuData,
  updateLoggedStuPassword,
  updateLoggedStuData,
  deleteLoggedStuData
} = require("../controller/studentServices");
const router = express.Router({ mergeParams: true });

router.use("/:studentId/courses", coursesRoute);

router.get('/getme' ,authServicesForStu.protect ,getLoggedStuData, getStudent)
router.put('/changeMyPassword' ,authServicesForStu.protect ,changeLoggedStuValidator , updateLoggedStuPassword)
router.put(
  '/updateMe',
  authServicesForStu.protect,
  uploadStudentImage,
    resizeImage,
   updateLoggedStuDataValidator,
   updateLoggedStuData 
   );
router.delete('/deleteMe',authServicesForStu.protect,deleteLoggedStuData );

router.put("/changePassword/:id",authServicesForLec.protect,authServicesForLec.allowedTo("admin"),changeStudentPasswordValidator,changeStudentPassword);

router
  .route("/")
  .get(authServicesForLec.protect,authServicesForLec.allowedTo("admin","manager"),createFilterObj,getAllStudent)
  .post
  (authServicesForLec.protect,
    authServicesForLec.allowedTo("admin","manager"),
    uploadStudentImage,
    resizeImage,
    setCoursesIDToBody,
    createStudentValidator,
    createStudent);
router
  .route("/:id")
  .get(
    authServicesForLec.protect,
    authServicesForLec.allowedTo("admin","manager"),
    getStudentValidator,
     getStudent)
  .put(
    authServicesForLec.protect,
    authServicesForLec.allowedTo("admin","manager"),
    uploadStudentImage,
    resizeImage,
    updateStudentValidator,
    updateSpecificStudent)
  .delete(authServicesForLec.protect,authServicesForLec.allowedTo("admin","manager"),deleteStudentValidator, deleteSpecificStudent)
  router
  .route('/CoursesForStudent/:id')
  .get(authServicesForLec.protect,authServicesForLec.allowedTo("admin","manager"),getStudentValidator,getCoursesForStudent)

  router
  .route('/search/:keyword')
  .get(authServicesForStu.protect,authServicesForStu.allowedTo("admin" , "manager"),searchForStudent)
module.exports = router;
