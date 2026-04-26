const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late'],
    required: true
  }
});

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  className: {
    type: String,
    required: true,
    trim: true
  },
  records: [attendanceRecordSchema]
}, {
  timestamps: true
});

// Ensure only one attendance record per class per date
attendanceSchema.index({ date: 1, className: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
