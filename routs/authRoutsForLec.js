const express = require("express");

const {
  signup,
  login,
  forgetPassword,
  verifyPassResetCode,
  resetPassword
} = require("../controller/authServicesForLec");
const {
  signupValidator,
  loginValidator,
} = require("../utils/validators/authLecValidator");

const {
  uploadLecturerImage,
  resizeImage
} = require('../controller/lecturerServices')

const router = express.Router();

router
.route("/signup")
.post(
  uploadLecturerImage,
  resizeImage,
  signupValidator,
  signup);
router.route("/login").post(loginValidator, login);
router.route("/forgotPassword").post(forgetPassword);
router.route("/verifyResetCode").post(verifyPassResetCode);
router.route("/resetPassword").put(resetPassword);


module.exports = router;
