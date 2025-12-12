const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const LeaveApplication = require('../models/LeaveApplication');
const LeaveBalance = require('../models/LeaveBalance');
const User = require('../models/User');

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Apply for leave
router.post('/apply', verifyToken, async (req, res) => {
    try {
        const { startDate, endDate, leaveType, reason } = req.body;
        
        const leaveApplication = new LeaveApplication({
            user: req.userId,
            startDate,
            endDate,
            leaveType,
            reason,
            status: 'pending'
        });
        
        await leaveApplication.save();
        
        res.status(201).json({
            message: 'Leave application submitted successfully',
            application: leaveApplication
        });
    } catch (error) {
        console.error('Apply leave error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user's leave applications
router.get('/my-applications', verifyToken, async (req, res) => {
    try {
        const applications = await LeaveApplication.find({ user: req.userId })
            .sort({ appliedDate: -1 });
        
        res.json(applications);
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get leave balance
router.get('/balance', verifyToken, async (req, res) => {
    try {
        const balance = await LeaveBalance.findOne({ user: req.userId });
        
        if (!balance) {
            // Create default balance if not exists
            const newBalance = new LeaveBalance({
                user: req.userId,
                casualLeaves: 12,
                sickLeaves: 10,
                earnedLeaves: 15
            });
            await newBalance.save();
            return res.json(newBalance);
        }
        
        res.json(balance);
    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Cancel pending leave application
router.put('/cancel/:id', verifyToken, async (req, res) => {
    try {
        const application = await LeaveApplication.findOne({
            _id: req.params.id,
            user: req.userId
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
        console.error('Cancel application error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get team leave requests (Manager only)
router.get('/team-requests', verifyToken, async (req, res) => {
    try {
        if (req.userRole !== 'manager') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        // Get all employees (in real app, get manager's team)
        const users = await User.find({ role: 'employee' });
        const employeeIds = users.map(user => user._id);
        
        const requests = await LeaveApplication.find({
            user: { $in: employeeIds },
            status: 'pending'
        }).populate('user', 'name email');
        
        res.json(requests);
    } catch (error) {
        console.error('Team requests error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;