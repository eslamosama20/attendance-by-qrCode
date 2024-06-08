const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

exports.uploadSingleImage = (fieldName) => {
  //Memory Storage ingine (بترجع Buffer)
  const multerStorage = multer.memoryStorage();

  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("only images", 404), false);
    }
  };

  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

  return upload.single(fieldName);
};
