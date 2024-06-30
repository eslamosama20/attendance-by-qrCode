// const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const helmet = require('helmet');

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

// Connection to DB
dbConnection();

// Express app
const app = express();
app.use(cors());
app.use(helmet()); // استخدام helmet لضبط إعدادات الأمان

// Middlewares
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`mode : ${process.env.NODE_ENV}`);
}

// Mount routes
app.use('/api/v1/student', studentRouts);
app.use('/api/v1/courses', coursesRouts);
app.use('/api/v1/lecturer', lecturerRouts);
app.use('/api/v1/lecture', lectureRouter);
app.use('/api/v1/authLec', authRoutsForLec);
app.use('/api/v1/authStu', authRoutsForStu);
app.use('/api/v1/attendance', attendanceRouts);

app.all('*', (req, res, next) => {
  next(new ApiError(`can't find this route ${req.originalUrl}`, 400));
});

// Global error handling middleware
app.use(globalError);

const PORT = process.env.PORT || 3000;

// Load SSL certificates
const sslOptions = {
  key: fs.readFileSync('path/to/your/private-key.pem'),
  cert: fs.readFileSync('path/to/your/certificate.pem')
};

// Create HTTPS server
const server = https.createServer(sslOptions, app);

server.listen(PORT, () => {
  console.log(`Server started at https://localhost:${PORT}`);
});

// Handle unhandledRejection outside Express
process.on('unhandledRejection', (err) => {
  console.log(`unhandledRejection: ${err.name} | ${err.message}`);
  server.close(() => {
    console.log('Shutdown');
    process.exit(1);
  });
});
