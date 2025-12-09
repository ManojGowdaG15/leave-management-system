const express = require('express');
const router = express.Router();
const LeaveApplication = require('../models/LeaveApplication');
const LeaveBalance = require('../models/LeaveBalance');
const User = require('../models/User');
const { authMiddleware, isManager } = require('../middleware/auth');

// Apply for leave
router.post('/apply', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, leaveType, reason } = req.body;

    if (!startDate || !endDate || !leaveType || !reason) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (numberOfDays <= 0) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const balance = await LeaveBalance.findOne({ userId: req.user._id });
    if (!balance) {
      return res.status(404).json({ message: 'Leave balance not found' });
    }

    const leaveTypeMap = {
      casual: 'casualLeaves',
      sick: 'sickLeaves',
      earned: 'earnedLeaves'
    };

    const balanceField = leaveTypeMap[leaveType];
    if (balance[balanceField] < numberOfDays) {
      return res.status(400).json({ 
        message: `Insufficient ${leaveType} leave balance. Available: ${balance[balanceField]} days` 
      });
    }

    const leaveApplication = await LeaveApplication.create({
      userId: req.user._id,
      startDate,
      endDate,
      leaveType,
      reason,
      numberOfDays
    });

    const populatedLeave = await LeaveApplication.findById(leaveApplication._id)
      .populate('userId', 'name email');

    res.status(201).json(populatedLeave);
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my leave applications
router.get('/my-applications', authMiddleware, async (req, res) => {
  try {
    const applications = await LeaveApplication.find({ userId: req.user._id })
      .sort({ appliedDate: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my leave balance
router.get('/my-balance', authMiddleware, async (req, res) => {
  try {
    let balance = await LeaveBalance.findOne({ userId: req.user._id });
    
    if (!balance) {
      balance = await LeaveBalance.create({
        userId: req.user._id,
        casualLeaves: 12,
        sickLeaves: 12,
        earnedLeaves: 15
      });
    }
    
    res.json(balance);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel leave application
router.patch('/cancel/:id', authMiddleware, async (req, res) => {
  try {
    const leave = await LeaveApplication.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Only pending applications can be cancelled' 
      });
    }

    leave.status = 'cancelled';
    await leave.save();

    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Manager: Get team leave requests
router.get('/team-requests', authMiddleware, isManager, async (req, res) => {
  try {
    const employees = await User.find({ managerId: req.user._id });
    const employeeIds = employees.map(emp => emp._id);

    const applications = await LeaveApplication.find({
      userId: { $in: employeeIds }
    })
    .populate('userId', 'name email')
    .sort({ appliedDate: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Manager: Approve/Reject leave
router.patch('/manage/:id', authMiddleware, isManager, async (req, res) => {
  try {
    const { status, managerComments } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const leave = await LeaveApplication.findById(req.params.id)
      .populate('userId', 'name email managerId');

    if (!leave) {
      return res.status(404).json({ message: 'Leave application not found' });
    }

    if (leave.userId.managerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to manage this leave' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Only pending applications can be approved/rejected' 
      });
    }

    leave.status = status;
    leave.managerComments = managerComments || '';
    leave.approvedDate = new Date();
    await leave.save();

    if (status === 'approved') {
      const balance = await LeaveBalance.findOne({ userId: leave.userId._id });
      const leaveTypeMap = {
        casual: 'casualLeaves',
        sick: 'sickLeaves',
        earned: 'earnedLeaves'
      };
      
      const balanceField = leaveTypeMap[leave.leaveType];
      balance[balanceField] -= leave.numberOfDays;
      await balance.save();
    }

    const updatedLeave = await LeaveApplication.findById(leave._id)
      .populate('userId', 'name email');

    res.json(updatedLeave);
  } catch (error) {
    console.error('Manage leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Manager: Get team leave calendar
router.get('/team-calendar', authMiddleware, isManager, async (req, res) => {
  try {
    const employees = await User.find({ managerId: req.user._id });
    const employeeIds = employees.map(emp => emp._id);

    const applications = await LeaveApplication.find({
      userId: { $in: employeeIds },
      status: 'approved'
    })
    .populate('userId', 'name email')
    .sort({ startDate: 1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;