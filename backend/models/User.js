const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['employee', 'manager', 'admin'],
        default: 'employee'
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    remainingLeaveDays: {
        type: Number,
        default: 20
    },
    joinedDate: {
        type: Date,
        default: Date.now
    },
    phone: String,
    position: String
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);