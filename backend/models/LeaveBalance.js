// backend/models/LeaveBalance.js
const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    casualLeaves: {
        type: Number,
        default: 12,
        min: 0
    },
    sickLeaves: {
        type: Number,
        default: 10,
        min: 0
    },
    earnedLeaves: {
        type: Number,
        default: 15,
        min: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Update leave balance when leave is approved
leaveBalanceSchema.statics.updateBalance = async function(userId, leaveType, days) {
    const balance = await this.findOne({ user: userId });
    
    if (!balance) {
        // Create balance record if doesn't exist
        const newBalance = new this({
            user: userId,
            casualLeaves: 12,
            sickLeaves: 10,
            earnedLeaves: 15
        });
        await newBalance.save();
    }
    
    const field = `${leaveType.toLowerCase()}Leaves`;
    if (balance[field] !== undefined) {
        balance[field] = Math.max(0, balance[field] - days);
        balance.lastUpdated = Date.now();
        await balance.save();
    }
    
    return balance;
};

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);