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

// Employee dashboard data
router.get('/employee', verifyToken, async (req, res) => {
    try {
        const [balance, applications] = await Promise.all([
            LeaveBalance.findOne({ user: req.userId }),
            LeaveApplication.find({ user: req.userId })
                .sort({ appliedDate: -1 })
                .limit(5)
        ]);
        
        res.json({
            leaveBalance: balance || {
                casualLeaves: 12,
                sickLeaves: 10,
                earnedLeaves: 15
            },
            recentApplications: applications
        });
    } catch (error) {
        console.error('Employee dashboard error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Manager dashboard data
router.get('/manager', verifyToken, async (req, res) => {
    try {
        if (req.userRole !== 'manager') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const [pendingCount, users] = await Promise.all([
            LeaveApplication.countDocuments({ status: 'pending' }),
            User.find({ role: 'employee' })
        ]);
        
        res.json({
            stats: {
                teamMembers: users.length,
                pendingRequests: pendingCount,
                approvedThisMonth: 0 // You can implement this
            },
            teamMembers: users.map(user => ({
                id: user._id,
                name: user.name,
                email: user.email
            }))
        });
    } catch (error) {
        console.error('Manager dashboard error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;