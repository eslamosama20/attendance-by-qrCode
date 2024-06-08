const userModel = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const ApiFeatures = require("../utils/apiFeatures");
const factory = require("./factoryHandlers");
const ApiError = require("../utils/apiError");

const bcrypt = require("bcryptjs");

const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const { uploadSingleImage } = require("../middleWares/uploadImageMiddleware");

//upload single image
exports.uploadUserImage = uploadSingleImage("profileImg");
//image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;
  if (req.file) {
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toFile(`uploads/users/${filename}`);
    //save image into our db
    req.body.profileImg = filename;
  }

  next();
});

// @desc get all users
// @route /api/v1/users
// @ access private
exports.getAllUsers = asyncHandler(async (req, res) => {
  const countDocuments = await userModel.countDocuments();
  const apiFeatures = new ApiFeatures(userModel.find(), req.query)
    .paginate(countDocuments)
    .filter()
    .limitFields()
    .sort();
  //execute query
  const { mongooseQuery, paginationResult } = apiFeatures;
  const user = await mongooseQuery;

  res.status(200).json({
    results: user.length,
    status: "success",
    paginationResult,
    data: user,
  });
});
// @desc create user
// @route /api/v1/user
// @ access private
exports.createUser = factory.createOne(userModel);
// @desc get specificBy id user
// @route /api/v1/user/:id
// @ access private
exports.getUser = factory.getOne(userModel);
// @desc get specificBy id user to view his courses
// @route /api/v1/usercourses/:id
// @ access private
exports.getCoursesForUser = factory.coursesForOne(userModel);
// @desc update specificBy id user
// @route /api/v1/user/:id
// @ access private

exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await userModel.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      phone: req.body.phone,
      email: req.body.email,
      profileImg: req.body.profileImg,
      role: req.body.role,
    },
    {
      new: true,
    }
  );

  if (!document) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: document });
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const doc = await userModel.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!doc) {
    return next(new ApiError(`No doc for this id ${req.params.id}`, 404));
  }
  res.status(200).json({ data: doc });
}); // @desc delete specificBy id user
// @route /api/v1/user/:id
// @ access private
exports.deleteSpecificUser = factory.deleteOne(userModel);

exports.searchForUSer = factory.search(userModel);
