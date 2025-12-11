const asyncHandler = require('express-async-handler');
const LeaveApplication = require('../models/LeaveApplication');
const User = require('../models/User');
const { validateLeaveDates } = require('../utils/validators');

// @desc    Apply for leave
// @route   POST /api/leaves/apply
// @access  Private
const applyLeave = asyncHandler(async (req, res) => {
    const { startDate, endDate, leaveType, reason } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!startDate || !endDate || !leaveType || !reason) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    // Validate dates
    const dateValidation = validateLeaveDates(startDate, endDate);
    if (!dateValidation.isValid) {
        res.status(400);
        throw new Error(dateValidation.message);
    }

    // Get user's leave balance
    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check leave balance
    if (user.leaveBalance[leaveType] < dateValidation.days) {
        res.status(400);
        throw new Error(`Insufficient ${leaveType} leave balance. Available: ${user.leaveBalance[leaveType]} days`);
    }

    // Find a manager for approval
    const manager = await User.findOne({ role: 'manager' });
    if (!manager) {
        res.status(404);
        throw new Error('No manager found for approval');
    }

    // Check for overlapping leaves
    const overlappingLeave = await LeaveApplication.findOne({
        userId,
        status: { $in: ['pending', 'approved'] },
        $or: [
            {
                startDate: { $lte: new Date(endDate) },
                endDate: { $gte: new Date(startDate) },
            },
        ],
    });

    if (overlappingLeave) {
        res.status(400);
        throw new Error('You already have a leave application for these dates');
    }

    // Create leave application
    const leaveApplication = await LeaveApplication.create({
        userId,
        startDate,
        endDate,
        leaveType,
        reason,
        daysCount: dateValidation.days,
        managerId: manager._id,
    });

    res.status(201).json({
        success: true,
        data: leaveApplication,
    });
});

// @desc    Get user's leave history
// @route   GET /api/leaves/history
// @access  Private
const getLeaveHistory = asyncHandler(async (req, res) => {
    const leaves = await LeaveApplication.find({ userId: req.user.id })
        .sort({ appliedDate: -1 })
        .populate('managerId', 'name email');

    res.json({
        success: true,
        count: leaves.length,
        data: leaves,
    });
});

// @desc    Cancel leave application
// @route   PUT /api/leaves/cancel/:id
// @access  Private
const cancelLeave = asyncHandler(async (req, res) => {
    const leave = await LeaveApplication.findById(req.params.id);

    if (!leave) {
        res.status(404);
        throw new Error('Leave application not found');
    }

    // Make sure user owns the leave application
    if (leave.userId.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to cancel this leave');
    }

    // Only allow cancellation if status is pending
    if (leave.status !== 'pending') {
        res.status(400);
        throw new Error('Cannot cancel leave that is already processed');
    }

    leave.status = 'cancelled';
    await leave.save();

    res.json({
        success: true,
        data: leave,
    });
});

// @desc    Get leave application by ID
// @route   GET /api/leaves/:id
// @access  Private
const getLeaveById = asyncHandler(async (req, res) => {
    const leave = await LeaveApplication.findById(req.params.id)
        .populate('userId', 'name email department')
        .populate('managerId', 'name email');

    if (!leave) {
        res.status(404);
        throw new Error('Leave application not found');
    }

    // Make sure user is authorized to view this leave
    if (
        leave.userId._id.toString() !== req.user.id &&
        leave.managerId._id.toString() !== req.user.id &&
        req.user.role !== 'admin'
    ) {
        res.status(403);
        throw new Error('Not authorized to view this leave');
    }

    res.json({
        success: true,
        data: leave,
    });
});

module.exports = {
    applyLeave,
    getLeaveHistory,
    cancelLeave,
    getLeaveById,
};