const express = require("express");

const {
  getqr,
  // getqrs,
  createqr,
  // updateqr,
  // deleteqr,
} = require("../controller/qrService");

// const authService = require('../services/authService');

const router = express.Router();

// router.use(authService.protect, authService.allowedTo('admin', 'manager'));

router.route("/").post(createqr);
router.route("/:id").get(getqr);

module.exports = router;
//////////////////////////////////////////////////////////