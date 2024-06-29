const Lecture = require('./../models/lectureModel');
const apiError = require('./../utils/apiError');
const catchAsync = require('./../utils/catchAsync');

exports.addNewLecture = catchAsync(async (req, res, next) => {
  const { lectureTitle, lectureNumber, course } = req.body;

  if (!lectureTitle || !lectureNumber || !course) {
    return next(
      new apiError(
        'please enter  lectureTitle,lectureNumber, course',
        400
      )
    );
  }

  const lecture = await Lecture.create({
    lectureTitle,
    lectureNumber,
    course,
  });

  res.status(201).json({
    data: {
      lecture,
    },
  });
});

// exports.getAllLectures = catchAsync(async (req, res, next) => {
//   const lectures = await Lecture.find();
//   res.status(200).json({
//     data: {
//       lectures,
//     },
//   });
// });

// exports.getLectureById = catchAsync(async (req, res, next) => {
//   const { id } = req.params;

//   const lecture = await Lecture.findById(id);
//   if (!lecture) return next(new apiError('this lecture does not exist', 404));
//   res.status(200).json({
//     data: {
//       lecture,
//     },
//   });
// });

// exports.deleteLecture = catchAsync(async (req, res, next) => {
//   const { id } = req.params;

//   const lecture = await Lecture.findByIdAndDelete(id);
//   if (!lecture) return next(new apiError('this lecture does not exist', 404));
//   res.status(200).json({
//     data: null,
//   });
// });

// exports.updateLecture = catchAsync(async (req, res, next) => {
//   const { id } = req.params;

//   const lecture = await Lecture.findByIdAndUpdate(id, req.body, { new: true });
//   if (!lecture) return next(new apiError('this lecture does not exist', 404));
//   res.status(200).json({
//     data: {
//       "msg": "lecture is updated successfully",
//     },
//   });
// });
