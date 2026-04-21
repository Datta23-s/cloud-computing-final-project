const mongoose = require('mongoose');

const LoginLogSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE'],
    required: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LoginLog', LoginLogSchema);
