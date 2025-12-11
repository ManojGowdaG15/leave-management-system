const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const LeaveApplication = require('../models/LeaveApplication');
const Expense = require('../models/Expense');

// @desc    Get employee dashboard data
// @route   GET /api/employee/dashboard
// @access  Private
const getDashboard = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Get user with leave balance
    const user = await User.findById(userId).select('-password');

    // Get recent leave applications
    const recentLeaves = await LeaveApplication.find({ userId })
        .sort({ appliedDate: -1 })
        .limit(5)
        .populate('managerId', 'name');

    // Get pending leaves count
    const pendingLeaves = await LeaveApplication.countDocuments({
        userId,
        status: 'pending',
    });

    // Get approved leaves count
    const approvedLeaves = await LeaveApplication.countDocuments({
        userId,
        status: 'approved',
    });

    // Get recent expenses
    const recentExpenses = await Expense.find({ userId })
        .sort({ submittedDate: -1 })
        .limit(5);

    // Get pending expenses count
    const pendingExpenses = await Expense.countDocuments({
        userId,
        status: 'pending',
    });

    res.json({
        success: true,
        data: {
            user,
            stats: {
                leaveBalance: user.leaveBalance,
                pendingLeaves,
                approvedLeaves,
                pendingExpenses,
            },
            recentLeaves,
            recentExpenses,
        },
    });
});

// @desc    Get employee leave balance
// @route   GET /api/employee/leave-balance
// @access  Private
const getLeaveBalance = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('leaveBalance');

    res.json({
        success: true,
        data: user.leaveBalance,
    });
});

// @desc    Get employee's pending leaves
// @route   GET /api/employee/pending-leaves
// @access  Private
const getPendingLeaves = asyncHandler(async (req, res) => {
    const leaves = await LeaveApplication.find({
        userId: req.user.id,
        status: 'pending',
    })
        .sort({ appliedDate: -1 })
        .populate('managerId', 'name email');

    res.json({
        success: true,
        count: leaves.length,
        data: leaves,
    });
});

module.exports = {
    getDashboard,
    getLeaveBalance,
    getPendingLeaves,
};