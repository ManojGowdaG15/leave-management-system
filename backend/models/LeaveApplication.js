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
    daysCount: {
        type: Number,
        required: true
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('LeaveApplication', leaveApplicationSchema);