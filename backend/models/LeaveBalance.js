const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    casual: {
        type: Number,
        default: 12,
        min: [0, 'Leave balance cannot be negative'],
    },
    sick: {
        type: Number,
        default: 10,
        min: [0, 'Leave balance cannot be negative'],
    },
    earned: {
        type: Number,
        default: 15,
        min: [0, 'Leave balance cannot be negative'],
    },
    fiscalYear: {
        type: Number,
        default: new Date().getFullYear(),
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);