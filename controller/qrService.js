
const asyncHandler = require("express-async-handler");
const QRCode = require("qrcode");
//const factory = require("../controller/factoryHandlers");
const qr = require("../models/qr");
const ApiError = require("../utils/apiError");

// Nested route
// GET /api/v1/products/:productId/qrs
// exports.createFilterObj = (req, res, next) => {
//   let filterObject = {};
//   if (req.params.productId) filterObject = { product: req.params.productId };
//   req.filterObj = filterObject;
//   next();
// };

// @desc    Get list of qrs
// @route   GET /api/v1/qrs
// @access  Public
//exports.getqrs = factory.getAll(qr);

// @desc    Get specific qr by id
// @route   GET /api/v1/qrs/:id
// @access  Public
exports.getqr = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  // Build query to find QR code by ID and check expiration time
  const qrcode = await qr.findOne({
    _id: id,
    expire: { $gt: Date.now() }, // Check if expiration time is in the future
  });

  if (!qrcode) {
    return next(new ApiError(`Coupon is invalid or expired`));
  }

  res.status(200).json({ data: qrcode });
});

exports.createqr = asyncHandler(async (req, res, next) => {
  // Set expiration time to 1 minute (60 seconds) from now
  req.body.expire = new Date(Date.now() + 60 * 1000);
  const qrcode = await qr.create(req.body);

  // Generate QR code with the token
  QRCode.toDataURL(JSON.stringify({ userId: qrcode }), (err, qrCodeDataUrl) => {
    if (err) {
      console.error("Error generating QR code:", err);
      return next(new ApiError("Error generating QR code", 500));
    }
    qrcode.qr = qrCodeDataUrl;
    qrcode.save();
    // Send response with QR code data URL
    res.status(200).json({ data: qrcode });
  });
});

// @desc    Update specific qr
// @route   PUT /api/v1/qrs/:id
// @access  Private/Protect/User
//exports.updateqr = factory.updateOne(qr);

// @desc    Delete specific qr
// @route   DELETE /api/v1/qrs/:id
// @access  Private/Protect/User-Admin-Manager
//exports.deleteqr = factory.deleteOne(qr);
