const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        enum: ['Travel', 'Food', 'Accommodation', 'Office Supplies', 'Others'],
        required: true
    },
    expenseDate: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    receiptDetails: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    managerComments: {
        type: String,
        default: ''
    },
    submittedDate: {
        type: Date,
        default: Date.now
    },
    approvedDate: {
        type: Date
    }
});

module.exports = mongoose.model('Expense', ExpenseSchema);