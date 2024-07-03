const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');

dotenv.config({ path: 'config.env' });
const dbConnection = require('./config/database');
const studentRouts = require('./routs/studentRouts');
const coursesRouts = require('./routs/coursesRouts');
const lectureRouter = require('./routs/lectureRoutes');
const authRoutsForLec = require('./routs/authRoutsForLec');
const authRoutsForStu = require('./routs/authRoutsForStu');
const attendanceRouts = require('./routs/attendanceRouts');
const ApiError = require('./utils/apiError');
const lecturerRouts = require('./routs/lecturerRouts');
const globalError = require('./middleWares/errorMiddleWare');

// connection DB
dbConnection();

// express app
const app = express();
app.use(cors());
app.options('*', cors());

// middleWares
app.use(express.json());
console.log(`mode: ${process.env.NODE_ENV}`);
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// mount routes
app.use('/api/v1/student', studentRouts);
app.use('/api/v1/courses', coursesRouts);
app.use('/api/v1/lecturer', lecturerRouts);
app.use('/api/v1/lecture', lectureRouter);
app.use('/api/v1/authLec', authRoutsForLec);
app.use('/api/v1/authStu', authRoutsForStu);
app.use('/api/v1/attendance', attendanceRouts);

// test route
app.get('/test', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Test route is working!'
  });
});

app.all('*', (req, res, next) => {
  next(new ApiError(`can't find this route ${req.originalUrl}`, 400));
});

// global error handling middleWare
app.use(globalError);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});

// unhandledRejection outside express
process.on('unhandledRejection', (err) => {
  console.log(`unhandledRejection: ${err.name} | ${err.message}`);
  server.close(() => {
    console.log('shutDown');
    process.exit(1);
  });
});
