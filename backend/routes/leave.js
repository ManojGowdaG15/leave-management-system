const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const LeaveApplication = require('../models/LeaveApplication');
const LeaveBalance = require('../models/LeaveBalance');
const User = require('../models/User');

// Apply for leave
router.post('/apply', auth, async (req, res) => {
    try {
        const { startDate, endDate, leaveType, reason } = req.body;
        const userId = req.user.userId;
        
        // Calculate days count
        const start = new Date(startDate);
        const end = new Date(endDate);
        const daysCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        
        // Check leave balance
        const leaveBalance = await LeaveBalance.findOne({ user: userId });
        
        if (!leaveBalance) {
            return res.status(400).json({ error: 'Leave balance not found' });
        }
        
        // Check available leaves
        if (leaveType === 'casual' && leaveBalance.casualLeaves < daysCount) {
            return res.status(400).json({ error: 'Insufficient casual leaves' });
        }
        if (leaveType === 'sick' && leaveBalance.sickLeaves < daysCount) {
            return res.status(400).json({ error: 'Insufficient sick leaves' });
        }
        if (leaveType === 'earned' && leaveBalance.earnedLeaves < daysCount) {
            return res.status(400).json({ error: 'Insufficient earned leaves' });
        }
        
        // Create leave application
        const leaveApplication = new LeaveApplication({
            user: userId,
            startDate,
            endDate,
            leaveType,
            reason,
            daysCount
        });
        
        await leaveApplication.save();
        
        res.status(201).json({
            message: 'Leave application submitted successfully',
            application: leaveApplication
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user's leave applications
router.get('/my-applications', auth, async (req, res) => {
    try {
        const applications = await LeaveApplication.find({ user: req.user.userId })
            .sort({ appliedDate: -1 });
        
        res.json(applications);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get leave balance
router.get('/balance', auth, async (req, res) => {
    try {
        const balance = await LeaveBalance.findOne({ user: req.user.userId });
        
        if (!balance) {
            return res.status(404).json({ error: 'Leave balance not found' });
        }
        
        res.json(balance);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Cancel pending leave application
router.put('/cancel/:id', auth, async (req, res) => {
    try {
        const application = await LeaveApplication.findOne({
            _id: req.params.id,
            user: req.user.userId
        });
        
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }
        
        if (application.status !== 'pending') {
            return res.status(400).json({ error: 'Only pending applications can be cancelled' });
        }
        
        application.status = 'cancelled';
        await application.save();
        
        res.json({ message: 'Leave application cancelled successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Manager: Get team leave requests
router.get('/team-requests', auth, async (req, res) => {
    try {
        if (req.user.role !== 'manager') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        // Find all employees managed by this manager
        const teamMembers = await User.find({ manager: req.user.userId });
        const teamMemberIds = teamMembers.map(member => member._id);
        
        const requests = await LeaveApplication.find({
            user: { $in: teamMemberIds },
            status: 'pending'
        })
        .populate('user', 'name email')
        .sort({ appliedDate: -1 });
        
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Manager: Approve/Reject leave
router.put('/approve/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'manager') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const { status, comments } = req.body;
        
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const application = await LeaveApplication.findById(req.params.id)
            .populate('user');
        
        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }
        
        // Check if manager manages this employee
        const isTeamMember = await User.findOne({
            _id: application.user._id,
            manager: req.user.userId
        });
        
        if (!isTeamMember) {
            return res.status(403).json({ error: 'Not authorized to manage this employee' });
        }
        
        application.status = status;
        application.managerComments = comments || '';
        await application.save();
        
        // If approved, deduct from leave balance
        if (status === 'approved') {
            const leaveBalance = await LeaveBalance.findOne({ user: application.user._id });
            
            if (leaveBalance) {
                if (application.leaveType === 'casual') {
                    leaveBalance.casualLeaves -= application.daysCount;
                } else if (application.leaveType === 'sick') {
                    leaveBalance.sickLeaves -= application.daysCount;
                } else if (application.leaveType === 'earned') {
                    leaveBalance.earnedLeaves -= application.daysCount;
                }
                await leaveBalance.save();
            }
        }
        
        res.json({ 
            message: `Leave application ${status} successfully`,
            application 
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get team leave calendar
router.get('/team-calendar', auth, async (req, res) => {
    try {
        if (req.user.role !== 'manager') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const teamMembers = await User.find({ manager: req.user.userId });
        const teamMemberIds = teamMembers.map(member => member._id);
        
        const approvedLeaves = await LeaveApplication.find({
            user: { $in: teamMemberIds },
            status: 'approved'
        })
        .populate('user', 'name email')
        .select('user startDate endDate leaveType reason');
        
        res.json(approvedLeaves);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;