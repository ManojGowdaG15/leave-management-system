// backend/models/LeaveApplication.js
const mongoose = require('mongoose');

const leaveApplicationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    leaveType: {
        type: String,
        enum: ['Casual', 'Sick', 'Earned'],
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
    reason: {
        type: String,
        required: true
    },
    contactDuringLeave: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
        default: 'Pending'
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
    }
}, {
    timestamps: true
});

// Calculate leave duration in days
leaveApplicationSchema.virtual('duration').get(function() {
    const diffTime = Math.abs(new Date(this.endDate) - new Date(this.startDate));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
});

module.exports = mongoose.model('LeaveApplication', leaveApplicationSchema);