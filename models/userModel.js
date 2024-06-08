// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");
// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       trim: true,
//       required: [true, "name required"],
//     },
//     email: {
//       type: String,
//       required: [true, "email required"],
//       unique: true,
//       lowercase: true,
//     },
//     phone: String,
//     profileImg: String,
//     password: {
//       type: String,
//       required: [true, "password required"],
//       minlength: [8, "too short pasword"],
//     },
//     passwordChangedAt: Date,
//     role: {
//       type: String,
//       enum: ["user", "admin","manager"],
//       default: "user",
//     },
//     active: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   { timestamps: true }
// );
// userSchema.pre("save", async function (next) {
//   if (!this.isModified('password'))
//   return  next()
//    this.password = await bcrypt.hash(this.password, 12);
//   next();
// });
// const user = mongoose.model("user", userSchema);
// module.exports = user;
