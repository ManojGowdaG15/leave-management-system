const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: [true, 'Please add an amount'],
        min: [0, 'Amount cannot be negative'],
    },
    category: {
        type: String,
        enum: ['Travel', 'Food', 'Accommodation', 'Office Supplies', 'Others'],
        required: [true, 'Please select a category'],
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    expenseDate: {
        type: Date,
        required: [true, 'Please add expense date'],
    },
    receiptUrl: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    managerComments: {
        type: String,
        default: '',
    },
    submittedDate: {
        type: Date,
        default: Date.now,
    },
    approvedDate: {
        type: Date,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Expense', expenseSchema);