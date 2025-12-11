const mongoose = require('mongoose');

const leaveApplicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    startDate: {
        type: Date,
        required: [true, 'Please add a start date'],
    },
    endDate: {
        type: Date,
        required: [true, 'Please add an end date'],
    },
    leaveType: {
        type: String,
        enum: ['casual', 'sick', 'earned'],
        required: [true, 'Please select a leave type'],
    },
    reason: {
        type: String,
        required: [true, 'Please add a reason'],
        maxlength: [500, 'Reason cannot be more than 500 characters'],
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'pending',
    },
    managerComments: {
        type: String,
        default: '',
        maxlength: [500, 'Comments cannot be more than 500 characters'],
    },
    appliedDate: {
        type: Date,
        default: Date.now,
    },
    daysCount: {
        type: Number,
        required: true,
        min: [1, 'Leave must be at least 1 day'],
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});

// Calculate daysCount before saving
leaveApplicationSchema.pre('save', function (next) {
    if (this.startDate && this.endDate) {
        const diffTime = Math.abs(this.endDate - this.startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        this.daysCount = diffDays;
    }
    next();
});

module.exports = mongoose.model('LeaveApplication', leaveApplicationSchema);