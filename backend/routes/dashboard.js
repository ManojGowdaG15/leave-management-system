const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const LeaveApplication = require('../models/LeaveApplication');
const LeaveBalance = require('../models/LeaveBalance');
const User = require('../models/User');

// Employee dashboard data
router.get('/employee', auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Get leave balance
        const leaveBalance = await LeaveBalance.findOne({ user: userId });
        
        // Get recent leave applications
        const recentApplications = await LeaveApplication.find({ user: userId })
            .sort({ appliedDate: -1 })
            .limit(5);
        
        // Count applications by status
        const pendingCount = await LeaveApplication.countDocuments({ 
            user: userId, 
            status: 'pending' 
        });
        const approvedCount = await LeaveApplication.countDocuments({ 
            user: userId, 
            status: 'approved' 
        });
        
        res.json({
            leaveBalance: leaveBalance || { casualLeaves: 12, sickLeaves: 10, earnedLeaves: 15 },
            recentApplications,
            stats: {
                pending: pendingCount,
                approved: approvedCount,
                total: recentApplications.length
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Manager dashboard data
router.get('/manager', auth, async (req, res) => {
    try {
        if (req.user.role !== 'manager') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const userId = req.user.userId;
        
        // Get team members count
        const teamMembers = await User.find({ manager: userId });
        const teamMemberIds = teamMembers.map(member => member._id);
        
        // Get pending leave requests count
        const pendingRequests = await LeaveApplication.countDocuments({
            user: { $in: teamMemberIds },
            status: 'pending'
        });
        
        // Get approved this month count
        const currentMonth = new Date();
        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        
        const approvedThisMonth = await LeaveApplication.countDocuments({
            user: { $in: teamMemberIds },
            status: 'approved',
            appliedDate: { $gte: firstDay, $lte: lastDay }
        });
        
        res.json({
            stats: {
                teamMembers: teamMembers.length,
                pendingRequests,
                approvedThisMonth
            },
            teamMembers: teamMembers.map(member => ({
                id: member._id,
                name: member.name,
                email: member.email
            }))
        });
    } catch (error) {
        console.error('Manager dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch manager dashboard data' });
    }
});

module.exports = router;