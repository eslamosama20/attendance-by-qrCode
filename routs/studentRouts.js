const express = require("express");
const authServicesForStu = require("../controller/authServicesForStu");
const authServicesForLec = require("../controller/authServicesForLec");
const coursesRoute = require("./coursesRouts");

const {
  getStudentValidator,
  createStudentValidator,
  updateStudentValidator,
  deleteStudentValidator,
  changeStudentPasswordValidator,
  changeLoggedStuValidator,
  updateLoggedStuDataValidator,
} = require("../utils/validators/studentValidator");

const {
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
  deleteLoggedStuData,
  getCoursesForStudent,
} = require("../controller/studentServices");
// const router = express.Router({ mergeParams: true });

// router.use('/:studentId/courses', coursesRoute);
const router = express.Router();

router.get("/getme", authServicesForStu.protect, getLoggedStuData, getStudent);
router.put(
  "/changeMyPassword",
  authServicesForStu.protect,
  changeLoggedStuValidator,
  updateLoggedStuPassword
);
router.put(
  "/updateMe",
  authServicesForStu.protect,
  uploadStudentImage,
  resizeImage,
  updateLoggedStuDataValidator,
  updateLoggedStuData
);
router.delete("/deleteMe", authServicesForStu.protect, deleteLoggedStuData);

router.put(
  "/changePassword/:id",
  authServicesForLec.protect,
  authServicesForLec.allowedTo("admin"),
  changeStudentPasswordValidator,
  changeStudentPassword
);

router
  .route("/")
  .get(
    authServicesForLec.protect,
    authServicesForLec.allowedTo("admin"),
    createFilterObj,
    getAllStudent
  )
  .post(
    authServicesForLec.protect,
    authServicesForLec.allowedTo("admin"),
    uploadStudentImage,
    resizeImage,
    setCoursesIDToBody,
    createStudentValidator,
    createStudent
  );
router
  .route("/:id")
  .get(
    authServicesForLec.protect,
    authServicesForLec.allowedTo("admin"),
    getStudentValidator,
    getStudent
  )
  .put(
    authServicesForLec.protect,
    authServicesForLec.allowedTo("admin"),
    uploadStudentImage,
    resizeImage,
    updateStudentValidator,
    updateSpecificStudent
  )
  .delete(
    authServicesForLec.protect,
    authServicesForLec.allowedTo("admin"),
    deleteStudentValidator,
    deleteSpecificStudent
  );
router
  .route("/CoursesForStudent/:id")
  .get(
    authServicesForStu.protect,
    authServicesForStu.allowedTo("admin","student"),
    getStudentValidator,
    getCoursesForStudent
  );

router
  .route("/search/:keyword")
  .get(
    // authServicesForLec.protect,
    // authServicesForLec.allowedTo("admin"),
    searchForStudent
  );
module.exports = router;
