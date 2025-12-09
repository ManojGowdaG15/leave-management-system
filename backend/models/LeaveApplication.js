const mongoose = require('mongoose');

const leaveApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  leaveType: {
    type: String,
    enum: ['casual', 'sick', 'earned'],
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  managerComments: {
    type: String,
    default: ''
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  approvedDate: {
    type: Date
  },
  numberOfDays: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('LeaveApplication', leaveApplicationSchema);