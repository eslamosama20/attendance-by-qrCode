const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const mongoose = require("mongoose");
dotenv.config({ path: "config.env" });
const dbConnection = require("./config/database");
const studentRouts = require("./routs/studentRouts");
const coursesRouts = require("./routs/coursesRouts");
const userRouts = require("./routs/userRouts");
const authRoutsForLec = require("./routs/authRoutsForLec");
const authRoutsForStu = require("./routs/authRoutsForStu");
const attendanceRouts = require("./routs/attendanceRouts");

const ApiError = require('./utils/apiError')


const qrRoute = require("./routs/qrRoute");


const lecturerRouts = require("./routs/lecturerRouts");
const globalError = require("./middleWares/errorMiddleWare");

// connection DB
dbConnection();

// express app
const app = express();
// middleWares
app.use(express.json());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode : ${process.env.NODE_ENV}`);
}
// mount routes
app.use("/api/v1/student", studentRouts);
app.use("/api/v1/courses", coursesRouts);
app.use("/api/v1/lecturer", lecturerRouts);
app.use("/api/v1/authLec", authRoutsForLec);
app.use("/api/v1/authStu", authRoutsForStu);
app.use("/api/v1/attendance", attendanceRouts);
app.use("/api/v1/qr", qrRoute);


app.all("*", (req, res, next) => {
  // create error and send it to error handling middleWare
  // const err =new Error(`can't find this route ${req.originalUrl}`)
  next(new ApiError(`can't find this route ${req.originalUrl}`, 400));
});
// global error handling middleWare
app.use(globalError);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});
// events ===> list ===> callback(err)
// unhandledRejection outside express
process.on("unhandledRejection", (err) => {
  console.log(`unhandledRejection : ${err.name}|${err.message}`);
  server.close(() => {
    console.log("shutDown");

    process.exit(1);
  });
});
