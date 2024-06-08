
const mongoose = require("mongoose");

const qrSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    qr: {
      type: String,
    },
    // parent reference (one to many)
    course: {
      type: mongoose.Schema.ObjectId,
      ref: "course",
      required: [true, "Review must belong to product"],
    },
    expire: {
      type: Date,
      required: [true, "course expire time required"],
    },
    // expireAt: {
    //   type: Date,
    //   default: Date.now,
    //   index: { expires: 1 }, // Automatically delete after 10 minutes
    // },
  },
  { timestamps: true }
);

qrSchema.pre("save", function (next) {
  this.populate({ path: "course", select: "name" });
  next();
});

qrSchema.pre(/^find/, function (next) {
  this.populate({ path: "course", select: "name" });
  next();
});

module.exports = mongoose.model("QR", qrSchema);


    