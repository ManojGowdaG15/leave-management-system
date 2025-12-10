const mongoose = require('mongoose');

const teamAssignmentSchema = new mongoose.Schema({
    manager_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
teamAssignmentSchema.index({ manager_id: 1 });
teamAssignmentSchema.index({ employee_id: 1 });
teamAssignmentSchema.index({ manager_id: 1, employee_id: 1 });

module.exports = mongoose.model('TeamAssignment', teamAssignmentSchema);