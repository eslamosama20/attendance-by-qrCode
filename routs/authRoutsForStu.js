const express = require('express');

const {
  signup,
  login,
  forgetPassword,
  verifyPassResetCode,
  resetPassword,
} = require('../controller/authServicesForStu');

const {
  signupValidator,
  loginValidator,
} = require('../utils/validators/authStuValidator');

const {
  uploadStudentImage,
  resizeImage,
} = require('../controller/studentServices');

const router = express.Router();

router
  .route('/signup')
  .post(uploadStudentImage, resizeImage, signupValidator, signup);

router.route('/login').post(loginValidator, login);
router.route('/forgotPassword').post(forgetPassword);
router.route('/verifyResetCode').post(verifyPassResetCode);
router.route('/resetPassword').put(resetPassword);

// .get(getAllUsers);

// router
//   .route("/:id")
//   .get(getUserValidator, getUser)
//   .put(updateUserValidator, updateUser)
//   .delete(deleteUserValidator, deleteSpecificUser);

// router.route("/search/:keyword").get(searchForUSer);

module.exports = router;
