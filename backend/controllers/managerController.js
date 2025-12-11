const asyncHandler = require('express-async-handler');
const LeaveApplication = require('../models/LeaveApplication');
const User = require('../models/User');
const Expense = require('../models/Expense');

// @desc    Get pending leave requests for manager's team
// @route   GET /api/manager/pending-leaves
// @access  Private/Manager
const getPendingLeaves = asyncHandler(async (req, res) => {
    // Get all employees under this manager
    const employees = await User.find({ managerId: req.user.id }).select('_id');
    const employeeIds = employees.map(emp => emp._id);

    const leaves = await LeaveApplication.find({
        userId: { $in: employeeIds },
        status: 'pending',
    })
        .populate('userId', 'name email department')
        .populate('managerId', 'name email')
        .sort({ appliedDate: -1 });

    res.json({
        success: true,
        count: leaves.length,
        data: leaves,
    });
});

// @desc    Approve leave request
// @route   PUT /api/manager/approve-leave/:id
// @access  Private/Manager
const approveLeave = asyncHandler(async (req, res) => {
    const { comments } = req.body;
    const leave = await LeaveApplication.findById(req.params.id)
        .populate('userId');

    if (!leave) {
        res.status(404);
        throw new Error('Leave application not found');
    }

    // Check if manager is authorized to approve this leave
    const employees = await User.find({ managerId: req.user.id }).select('_id');
    const employeeIds = employees.map(emp => emp._id.toString());

    if (!employeeIds.includes(leave.userId._id.toString())) {
        res.status(403);
        throw new Error('Not authorized to approve this leave');
    }

    // Update leave status
    leave.status = 'approved';
    leave.managerComments = comments || 'Approved';
    leave.managerId = req.user.id;
    await leave.save();

    // Deduct from user's leave balance
    const user = await User.findById(leave.userId);
    user.leaveBalance[leave.leaveType] -= leave.daysCount;
    await user.save();

    res.json({
        success: true,
        data: leave,
    });
});

// @desc    Reject leave request
// @route   PUT /api/manager/reject-leave/:id
// @access  Private/Manager
const rejectLeave = asyncHandler(async (req, res) => {
    const { comments } = req.body;
    const leave = await LeaveApplication.findById(req.params.id)
        .populate('userId');

    if (!leave) {
        res.status(404);
        throw new Error('Leave application not found');
    }

    // Check if manager is authorized to reject this leave
    const employees = await User.find({ managerId: req.user.id }).select('_id');
    const employeeIds = employees.map(emp => emp._id.toString());

    if (!employeeIds.includes(leave.userId._id.toString())) {
        res.status(403);
        throw new Error('Not authorized to reject this leave');
    }

    // Update leave status
    leave.status = 'rejected';
    leave.managerComments = comments || 'Rejected';
    leave.managerId = req.user.id;
    await leave.save();

    res.json({
        success: true,
        data: leave,
    });
});

// @desc    Get team leave calendar
// @route   GET /api/manager/team-calendar
// @access  Private/Manager
const getTeamCalendar = asyncHandler(async (req, res) => {
    // Get all employees under this manager
    const employees = await User.find({ managerId: req.user.id }).select('_id name email department');
    const employeeIds = employees.map(emp => emp._id);

    const leaves = await LeaveApplication.find({
        userId: { $in: employeeIds },
        status: 'approved',
    })
        .populate('userId', 'name')
        .select('startDate endDate leaveType userId');

    // Format data for calendar
    const calendarData = leaves.map(leave => ({
        id: leave._id,
        title: `${leave.userId.name} - ${leave.leaveType} Leave`,
        start: leave.startDate,
        end: leave.endDate,
        type: leave.leaveType,
        employee: leave.userId.name,
    }));

    res.json({
        success: true,
        data: {
            employees,
            leaves: calendarData,
        },
    });
});

// @desc    Get team overview
// @route   GET /api/manager/team-overview
// @access  Private/Manager
const getTeamOverview = asyncHandler(async (req, res) => {
    // Get all employees under this manager
    const employees = await User.find({ managerId: req.user.id })
        .select('name email department leaveBalance');

    // Get team leave statistics
    const teamLeaves = await LeaveApplication.find({
        userId: { $in: employees.map(emp => emp._id) },
    });

    // Calculate statistics
    const stats = {
        totalEmployees: employees.length,
        onLeaveToday: 0,
        pendingApprovals: await LeaveApplication.countDocuments({
            userId: { $in: employees.map(emp => emp._id) },
            status: 'pending',
        }),
        approvedThisMonth: teamLeaves.filter(leave => 
            leave.status === 'approved' && 
            new Date(leave.appliedDate).getMonth() === new Date().getMonth()
        ).length,
    };

    res.json({
        success: true,
        data: {
            stats,
            employees,
        },
    });
});

// @desc    Get pending expense claims
// @route   GET /api/manager/pending-expenses
// @access  Private/Manager
const getPendingExpenses = asyncHandler(async (req, res) => {
    // Get all employees under this manager
    const employees = await User.find({ managerId: req.user.id }).select('_id');
    const employeeIds = employees.map(emp => emp._id);

    const expenses = await Expense.find({
        userId: { $in: employeeIds },
        status: 'pending',
    })
        .populate('userId', 'name email department')
        .sort({ submittedDate: -1 });

    res.json({
        success: true,
        count: expenses.length,
        data: expenses,
    });
});

module.exports = {
    getPendingLeaves,
    approveLeave,
    rejectLeave,
    getTeamCalendar,
    getTeamOverview,
    getPendingExpenses,
};