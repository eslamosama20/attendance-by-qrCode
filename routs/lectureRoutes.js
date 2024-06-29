const express = require('express');
const { protect, allowedTo } = require('./../controller/authServicesForLec');
const {
  addNewLecture,
  updateLecture,
  getAllLectures,
  getLectureById,
  deleteLecture,
  
} = require('./../controller/lectureController');

const router = express.Router();

router
  .route('/')
  // .get(protect, allowedTo('manager'), getAllLectures)
  .post(protect, allowedTo('manager'), addNewLecture);
router
  .route('/:id')
  // .get(protect, allowedTo('admin', 'manager'), getLectureById)
  // .patch(protect, allowedTo('admin', 'manager'), updateLecture)
  // .delete(protect, allowedTo('admin', 'manager'), deleteLecture);


  

module.exports = router;
