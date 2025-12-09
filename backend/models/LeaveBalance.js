const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  casualLeaves: {
    type: Number,
    default: 12
  },
  sickLeaves: {
    type: Number,
    default: 12
  },
  earnedLeaves: {
    type: Number,
    default: 15
  },
  year: {
    type: Number,
    default: new Date().getFullYear()
  }
});

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);