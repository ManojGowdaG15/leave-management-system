const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const LeaveApplication = require('../models/LeaveApplication');
const LeaveBalance = require('../models/LeaveBalance');

// @desc    Get leave balance
// @route   GET /api/leave/balance
// @access  Private
router.get('/balance', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        
        let balance = await LeaveBalance.findOne({ user: userId })
            .select('casualLeaves sickLeaves earnedLeaves lastUpdated')
            .lean();

        if (!balance) {
            // Create default balance
            balance = {
                casualLeaves: 12,
                sickLeaves: 10,
                earnedLeaves: 15,
                lastUpdated: new Date()
            };
            await LeaveBalance.create({
                user: userId,
                ...balance
            });
        }

        res.json(balance);
    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({ error: 'Failed to get leave balance' });
    }
});

// @desc    Apply for leave
// @route   POST /api/leave/apply
// @access  Private
router.post('/apply', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const { leaveType, startDate, endDate, reason, contactDuringLeave } = req.body;

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (start > end) {
            return res.status(400).json({ error: 'End date must be after start date' });
        }

        if (start < new Date()) {
            return res.status(400).json({ error: 'Cannot apply for past dates' });
        }

        // Calculate days
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        // Check leave balance
        const balance = await LeaveBalance.findOne({ user: userId });
        if (balance) {
            const availableLeaves = balance[`${leaveType.toLowerCase()}Leaves`];
            if (availableLeaves < days) {
                return res.status(400).json({ 
                    error: `Insufficient ${leaveType} leave balance. Available: ${availableLeaves} days, Required: ${days} days` 
                });
            }
        }

        // Create leave application
        const leaveApplication = new LeaveApplication({
            user: userId,
            leaveType,
            startDate: start,
            endDate: end,
            reason,
            contactDuringLeave: contactDuringLeave || '',
            status: 'Pending',
            appliedDate: new Date()
        });

        await leaveApplication.save();

        res.status(201).json({
            message: 'Leave application submitted successfully',
            leaveApplication
        });
    } catch (error) {
        console.error('Apply leave error:', error);
        res.status(500).json({ error: 'Failed to apply for leave' });
    }
});

// @desc    Get leave history
// @route   GET /api/leave/history
// @access  Private
router.get('/history', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10, filter } = req.query;

        const query = { user: userId };
        if (filter && filter !== 'all') {
            query.status = filter;
        }

        const leaves = await LeaveApplication.find(query)
            .sort({ appliedDate: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        const total = await LeaveApplication.countDocuments(query);

        res.json({
            leaves,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Failed to get leave history' });
    }
});

// @desc    Cancel leave application
// @route   PUT /api/leave/cancel/:id
// @access  Private
router.put('/cancel/:id', protect, async (req, res) => {
    try {
        const leaveId = req.params.id;
        const userId = req.user._id;

        const leave = await LeaveApplication.findOne({
            _id: leaveId,
            user: userId,
            status: 'Pending'
        });

        if (!leave) {
            return res.status(404).json({ 
                error: 'Leave not found or cannot be cancelled' 
            });
        }

        leave.status = 'Cancelled';
        await leave.save();

        res.json({ 
            message: 'Leave cancelled successfully',
            leave 
        });
    } catch (error) {
        console.error('Cancel leave error:', error);
        res.status(500).json({ error: 'Failed to cancel leave' });
    }
});

// @desc    Get pending leave requests (for managers)
// @route   GET /api/leave/pending
// @access  Private/Manager
router.get('/pending', protect, authorize('manager'), async (req, res) => {
    try {
        const managerId = req.user._id;
        
        // Get team members
        const User = require('../models/User');
        const teamMembers = await User.find({ manager: managerId })
            .select('_id')
            .lean();

        const teamMemberIds = teamMembers.map(member => member._id);

        const { page = 1, limit = 10 } = req.query;

        const pendingRequests = await LeaveApplication.find({
            user: { $in: teamMemberIds },
            status: 'Pending'
        })
        .populate('user', 'name email')
        .sort({ appliedDate: 1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean();

        const total = await LeaveApplication.countDocuments({
            user: { $in: teamMemberIds },
            status: 'Pending'
        });

        // Calculate days for each request
        const requestsWithDays = pendingRequests.map(request => {
            const start = new Date(request.startDate);
            const end = new Date(request.endDate);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            
            return {
                ...request,
                days: days,
                employee_name: request.user?.name,
                employee_email: request.user?.email,
                user: undefined // Remove populated user object
            };
        });

        res.json({
            requests: requestsWithDays,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        console.error('Get pending requests error:', error);
        res.status(500).json({ error: 'Failed to get pending requests' });
    }
});

// @desc    Approve leave request
// @route   PUT /api/leave/approve/:id
// @access  Private/Manager
router.put('/approve/:id', protect, authorize('manager'), async (req, res) => {
    try {
        const leaveId = req.params.id;
        const { comments } = req.body;

        const leave = await LeaveApplication.findById(leaveId)
            .populate('user');

        if (!leave) {
            return res.status(404).json({ error: 'Leave request not found' });
        }

        // Check if manager is authorized (user's manager)
        const managerId = req.user._id;
        if (leave.user.manager.toString() !== managerId.toString()) {
            return res.status(403).json({ error: 'Not authorized to approve this leave' });
        }

        if (leave.status !== 'Pending') {
            return res.status(400).json({ error: 'Leave is not in pending status' });
        }

        // Update leave balance
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        await LeaveBalance.updateBalance(leave.user._id, leave.leaveType, days);

        // Update leave application
        leave.status = 'Approved';
        leave.managerComments = comments || '';
        leave.approvedDate = new Date();
        await leave.save();

        res.json({ 
            message: 'Leave approved successfully',
            leave 
        });
    } catch (error) {
        console.error('Approve leave error:', error);
        res.status(500).json({ error: 'Failed to approve leave' });
    }
});

// @desc    Reject leave request
// @route   PUT /api/leave/reject/:id
// @access  Private/Manager
router.put('/reject/:id', protect, authorize('manager'), async (req, res) => {
    try {
        const leaveId = req.params.id;
        const { reason } = req.body;

        if (!reason || reason.trim() === '') {
            return res.status(400).json({ error: 'Rejection reason is required' });
        }

        const leave = await LeaveApplication.findById(leaveId)
            .populate('user');

        if (!leave) {
            return res.status(404).json({ error: 'Leave request not found' });
        }

        // Check if manager is authorized
        const managerId = req.user._id;
        if (leave.user.manager.toString() !== managerId.toString()) {
            return res.status(403).json({ error: 'Not authorized to reject this leave' });
        }

        if (leave.status !== 'Pending') {
            return res.status(400).json({ error: 'Leave is not in pending status' });
        }

        leave.status = 'Rejected';
        leave.managerComments = reason;
        await leave.save();

        res.json({ 
            message: 'Leave rejected successfully',
            leave 
        });
    } catch (error) {
        console.error('Reject leave error:', error);
        res.status(500).json({ error: 'Failed to reject leave' });
    }
});

// @desc    Get team calendar (for managers)
// @route   GET /api/leave/team-calendar
// @access  Private/Manager
router.get('/team-calendar', protect, authorize('manager'), async (req, res) => {
    try {
        const managerId = req.user._id;
        
        // Get team members
        const User = require('../models/User');
        const teamMembers = await User.find({ manager: managerId })
            .select('_id name')
            .lean();

        const teamMemberIds = teamMembers.map(member => member._id);

        const leaves = await LeaveApplication.find({
            user: { $in: teamMemberIds },
            status: { $in: ['Pending', 'Approved'] }
        })
        .populate('user', 'name')
        .sort({ startDate: 1 })
        .lean();

        const calendarData = leaves.map(leave => {
            // Color coding based on status and leave type
            let color = '#FF6B6B'; // Default red for pending
            
            if (leave.status === 'Approved') {
                if (leave.leaveType === 'Casual') color = '#4ECDC4';
                else if (leave.leaveType === 'Sick') color = '#45B7D1';
                else if (leave.leaveType === 'Earned') color = '#96CEB4';
            }

            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            end.setDate(end.getDate() + 1); // Include end date

            return {
                id: leave._id,
                title: `${leave.user?.name || 'Unknown'} - ${leave.leaveType}`,
                start: start,
                end: end,
                allDay: true,
                backgroundColor: color,
                borderColor: color,
                extendedProps: {
                    userId: leave.user?._id,
                    userName: leave.user?.name || 'Unknown',
                    leaveType: leave.leaveType,
                    reason: leave.reason,
                    status: leave.status,
                    comments: leave.managerComments
                }
            };
        });

        res.json(calendarData);
    } catch (error) {
        console.error('Get team calendar error:', error);
        res.status(500).json({ error: 'Failed to get team calendar' });
    }
});

module.exports = router;