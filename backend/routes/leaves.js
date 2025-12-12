const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Leave = require('../models/Leave');
const User = require('../models/User');

// Apply for leave
router.post('/', auth, async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    const userId = req.user.userId;

    // Check if user has sufficient leave balance
    const user = await User.findById(userId);
    const leaveType = `${type}Leaves`;
    
    if (user.leaveBalance[type] <= 0) {
      return res.status(400).json({ error: 'Insufficient leave balance' });
    }

    // Create leave
    const leave = new Leave({
      userId,
      type,
      startDate,
      endDate,
      reason
    });

    await leave.save();

    res.status(201).json({
      message: 'Leave applied successfully',
      leave
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's leaves
router.get('/my-leaves', auth, async (req, res) => {
  try {
    const leaves = await Leave.find({ userId: req.user.userId })
      .sort({ appliedDate: -1 })
      .populate('userId', 'name email department');
    
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending leaves for manager
router.get('/pending', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get manager's team members
    const teamMembers = await User.find({ managerId: req.user.userId });
    const teamMemberIds = teamMembers.map(member => member._id);

    const pendingLeaves = await Leave.find({
      userId: { $in: teamMemberIds },
      status: 'pending'
    })
    .populate('userId', 'name email department')
    .sort({ appliedDate: -1 });

    res.json(pendingLeaves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update leave status
router.put('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { status, comment } = req.body;
    const leaveId = req.params.id;

    const leave = await Leave.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ error: 'Leave not found' });
    }

    // Update leave
    leave.status = status;
    if (comment) {
      leave.managerComment = comment;
    }
    leave.updatedBy = req.user.userId;

    // If approved, deduct from balance
    if (status === 'approved') {
      const user = await User.findById(leave.userId);
      const days = Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 3600 * 24)) + 1;
      
      if (user.leaveBalance[leave.type] >= days) {
        user.leaveBalance[leave.type] -= days;
        await user.save();
      } else {
        return res.status(400).json({ error: 'Insufficient leave balance' });
      }
    }

    await leave.save();

    res.json({
      message: `Leave ${status} successfully`,
      leave
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel leave
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const leaveId = req.params.id;
    const userId = req.user.userId;

    const leave = await Leave.findOne({ _id: leaveId, userId });
    if (!leave) {
      return res.status(404).json({ error: 'Leave not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending leaves can be cancelled' });
    }

    leave.status = 'cancelled';
    await leave.save();

    res.json({
      message: 'Leave cancelled successfully',
      leave
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get leave balance
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    res.json({
      casualLeaves: user.leaveBalance.casual,
      sickLeaves: user.leaveBalance.sick,
      earnedLeaves: user.leaveBalance.earned,
      usedCasual: 12 - user.leaveBalance.casual,
      usedSick: 10 - user.leaveBalance.sick,
      usedEarned: 15 - user.leaveBalance.earned
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;