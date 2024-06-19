const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');

exports.deleteOne = (model) =>
  asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const doc = await model.findByIdAndDelete(id);
    if (!doc) {
      return next(new ApiError(`no object for this ${id}`, 404));
    }
    res.status(200).json({
      status: 'success',
      "msg": "course is deleted successfully",
    });
  });
exports.getOne = (model) =>
  asyncHandler(async (req, res, next) => {
    const id = req.params.id;
    const doc = await model.findById(id);
    if (!doc) {
      return next(new ApiError(`no id name for this ${id}`, 404));
    }
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });
exports.updateOne = (model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new ApiError(`no courses for this ${id}`, 404));
    }

    res.status(200).json({
      status: 'success',
      "msg":"course is updated successfully",
    });
  });

exports.createOne = (model) =>
  asyncHandler(async (req, res) => {
    // const name =req.body.name;
    // const programme=req.body.programme
    // async&await
    const doc = await model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });
  
exports.search = (model) =>
  asyncHandler(async (req, res) => {
    const query = await model.find({
      $or: [
        { name: { $regex: req.params.keyword, $options: 'i' } },
        { programme: { $regex: req.params.keyword, $options: 'i' } },
      ],
    });
    res.status(200).json({
      status: 'success',
      result: query.length,
      data: {
        query,
      },
    });
  });
   // Assuming you have an ApiError class defined

exports.coursesForOneOnDay = (model) =>
    asyncHandler(async (req, res, next) => {
        const lecturerId = req.params.id;
        const lectureDay = req.params.lectureDay;

        if (!lecturerId || !lectureDay) {
            return next(new ApiError('Lecturer ID and lecture day are required', 400));
        }

        console.log(`Fetching courses for lecturer ID: ${lecturerId} on day: ${lectureDay}`);

        try {
            const courses = await model.find({ lecturerId, lectureDay });

            if (!courses || courses.length === 0) {
                console.log(`No courses found for lecturer ID: ${lecturerId} on day: ${lectureDay}`);
                return next(new ApiError(`No courses found for lecturer with id ${lecturerId} on day ${lectureDay}`, 404));
            }

            console.log(`Courses found: ${courses}`);

            res.status(200).json({
                status: 'success',
                data: courses,
            });
        } catch (error) {
            console.error(`Error fetching courses for lecturer ID: ${lecturerId}`, error);
            return next(new ApiError(`Error fetching courses for lecturer with id ${lecturerId}`, 500));
        }
    });


