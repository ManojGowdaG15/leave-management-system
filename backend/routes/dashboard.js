const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Import models
const User = require('../models/User');
const LeaveApplication = require('../models/LeaveApplication');
const LeaveBalance = require('../models/LeaveBalance');

// GET dashboard data
router.get('/', protect, async (req, res) => {
    try {
        const user = req.user;
        const userRole = user.role;
        const userId = user._id;

        if (userRole === 'employee') {
            // Employee dashboard data
            const [totalLeaves, pendingLeaves, approvedLeaves, rejectedLeaves] = await Promise.all([
                LeaveApplication.countDocuments({ user: userId }),
                LeaveApplication.countDocuments({ user: userId, status: 'Pending' }),
                LeaveApplication.countDocuments({ user: userId, status: 'Approved' }),
                LeaveApplication.countDocuments({ user: userId, status: 'Rejected' })
            ]);

            const recentLeaves = await LeaveApplication.find({ user: userId })
                .sort({ appliedDate: -1 })
                .limit(5)
                .select('leaveType startDate endDate status appliedDate reason')
                .lean();

            const leaveBalance = await LeaveBalance.findOne({ user: userId })
                .select('casualLeaves sickLeaves earnedLeaves')
                .lean() || { casualLeaves: 12, sickLeaves: 10, earnedLeaves: 15 };

            res.json({
                stats: {
                    totalLeaves: totalLeaves || 0,
                    pendingLeaves: pendingLeaves || 0,
                    approvedLeaves: approvedLeaves || 0,
                    rejectedLeaves: rejectedLeaves || 0
                },
                recentLeaves: recentLeaves || [],
                leaveBalance: leaveBalance
            });

        } else if (userRole === 'manager') {
            // Manager dashboard data
            const teamMembers = await User.find({ manager: userId })
                .select('_id name email')
                .lean();

            const teamMemberIds = teamMembers.map(member => member._id);

            let stats = { totalLeaves: 0, pendingLeaves: 0, approvedLeaves: 0, rejectedLeaves: 0 };
            let recentLeaves = [];
            let pendingRequests = [];

            if (teamMemberIds.length > 0) {
                // Get stats for team
                const [total, pending, approved, rejected] = await Promise.all([
                    LeaveApplication.countDocuments({ user: { $in: teamMemberIds } }),
                    LeaveApplication.countDocuments({ user: { $in: teamMemberIds }, status: 'Pending' }),
                    LeaveApplication.countDocuments({ user: { $in: teamMemberIds }, status: 'Approved' }),
                    LeaveApplication.countDocuments({ user: { $in: teamMemberIds }, status: 'Rejected' })
                ]);

                stats = { totalLeaves: total, pendingLeaves: pending, approvedLeaves: approved, rejectedLeaves: rejected };

                // Get recent leaves for team
                recentLeaves = await LeaveApplication.find({ user: { $in: teamMemberIds } })
                    .sort({ appliedDate: -1 })
                    .limit(5)
                    .populate('user', 'name email')
                    .select('leaveType startDate endDate status appliedDate reason')
                    .lean();

                // Get pending requests for team
                pendingRequests = await LeaveApplication.find({ 
                    user: { $in: teamMemberIds }, 
                    status: 'Pending' 
                })
                .sort({ appliedDate: 1 })
                .limit(5)
                .populate('user', 'name email')
                .select('leaveType startDate endDate status appliedDate reason')
                .lean();

                // Format data for frontend
                recentLeaves = recentLeaves.map(leave => ({
                    ...leave,
                    employee_name: leave.user?.name || 'Unknown',
                    employee_email: leave.user?.email || '',
                    user: undefined // Remove populated user object
                }));

                pendingRequests = pendingRequests.map(request => {
                    const start = new Date(request.startDate);
                    const end = new Date(request.endDate);
                    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                    
                    return {
                        ...request,
                        employee_name: request.user?.name || 'Unknown',
                        employee_email: request.user?.email || '',
                        days: days,
                        user: undefined // Remove populated user object
                    };
                });
            }

            res.json({
                stats,
                recentLeaves: recentLeaves || [],
                pendingRequests: pendingRequests || [],
                teamSize: teamMembers.length
            });

        } else {
            res.status(400).json({ error: 'Invalid user role' });
        }

    } catch (error) {
        console.error('❌ Dashboard error:', error);
        res.status(500).json({ 
            error: 'Failed to load dashboard data',
            message: error.message 
        });
    }
});

module.exports = router;