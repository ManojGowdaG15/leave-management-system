const mongoose = require('mongoose');

const leaveApplicationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    user_name: {
        type: String,
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    leave_type: {
        type: String,
        enum: ['casual', 'sick', 'earned'],
        required: true
    },
    reason: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'pending'
    },
    manager_comments: {
        type: String,
        default: ''
    },
    applied_date: {
        type: Date,
        default: Date.now
    },
    approved_date: {
        type: Date
    },
    approved_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approved_by_name: {
        type: String
    },
    leave_days: {
        type: Number,
        required: true,
        min: 1
    },
    year: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

// Calculate leave days before saving
leaveApplicationSchema.pre('save', function(next) {
    if (this.start_date && this.end_date) {
        const start = new Date(this.start_date);
        const end = new Date(this.end_date);
        const timeDiff = end.getTime() - start.getTime();
        this.leave_days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
        
        // Set year for filtering
        this.year = start.getFullYear();
    }
    
    next();
});

// Indexes
leaveApplicationSchema.index({ user_id: 1 });
leaveApplicationSchema.index({ status: 1 });
leaveApplicationSchema.index({ start_date: 1 });
leaveApplicationSchema.index({ end_date: 1 });
leaveApplicationSchema.index({ year: 1 });
leaveApplicationSchema.index({ user_id: 1, status: 1 });

const LeaveApplication = mongoose.model('LeaveApplication', leaveApplicationSchema);
module.exports = LeaveApplication;