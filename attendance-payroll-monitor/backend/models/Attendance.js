const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  recordId: {
    type: String,
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['checkin', 'checkout'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  date: {
    type: String, // Stored as a date string for easy filtering: "Tue Apr 21 2026"
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
