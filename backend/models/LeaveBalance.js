const mongoose = require('mongoose');

const LeaveBalanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    casualLeaves: {
        type: Number,
        default: 12
    },
    sickLeaves: {
        type: Number,
        default: 10
    },
    earnedLeaves: {
        type: Number,
        default: 15
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('LeaveBalance', LeaveBalanceSchema);