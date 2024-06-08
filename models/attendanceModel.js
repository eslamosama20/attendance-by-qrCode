const mongoose = require('mongoose');

// 1- إنشاء مخطط الحضور
const attendanceSchema = new mongoose.Schema(
    {
        courseCode:{
            type:String,
            required : [true, 'courseCode is required'],
            unique:[true,'the courseCode must be unique'],
            minLength : [3, 'courseCode must be at least 3 characters'],                                                                                                          
            maxLength : [100, 'courseCode is too long']
    
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'student', // يفترض وجود نموذج للمستخدم
        
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'course', // يفترض وجود نموذج للدورة
        },
        status: {
            type: String,
            enum: ['present', 'absent'], // حالات الحضور الممكنة
            default: 'absent'
        },
        date: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

// 2- إنشاء النموذج
const AttendanceModel = mongoose.model('Attendance', attendanceSchema);
module.exports = AttendanceModel;
