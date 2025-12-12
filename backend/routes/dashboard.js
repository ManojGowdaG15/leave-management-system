const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Leave = require('../models/Leave');

// Get dashboard data
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Get user details
    const user = await User.findById(userId, '-password');
    
    let dashboardData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId
      }
    };

    // Get leave balance
    const leaveBalance = {
      casualLeaves: user.leaveBalance.casual,
      sickLeaves: user.leaveBalance.sick,
      earnedLeaves: user.leaveBalance.earned,
      usedCasual: 12 - user.leaveBalance.casual,
      usedSick: 10 - user.leaveBalance.sick,
      usedEarned: 15 - user.leaveBalance.earned
    };
    
    dashboardData.leaveBalance = leaveBalance;

    // Get user's leaves
    const userLeaves = await Leave.find({ userId })
      .sort({ appliedDate: -1 })
      .limit(5);
    
    dashboardData.recentLeaves = userLeaves;

    // Calculate leave stats
    const allLeaves = await Leave.find({ userId });
    const leaveStats = {
      total: allLeaves.length,
      pending: allLeaves.filter(l => l.status === 'pending').length,
      approved: allLeaves.filter(l => l.status === 'approved').length,
      rejected: allLeaves.filter(l => l.status === 'rejected').length,
      cancelled: allLeaves.filter(l => l.status === 'cancelled').length
    };
    
    dashboardData.leaveStats = leaveStats;

    // If user is manager, get team data
    if (userRole === 'manager' || userRole === 'admin') {
      // Get team members
      const teamMembers = await User.find({ 
        managerId: userId,
        isActive: true 
      }).countDocuments();
      
      dashboardData.teamMembers = teamMembers;

      // Get pending leaves for approval
      const teamUsers = await User.find({ managerId: userId });
      const teamUserIds = teamUsers.map(member => member._id);
      
      const pendingLeaves = await Leave.find({
        userId: { $in: teamUserIds },
        status: 'pending'
      })
      .populate('userId', 'name email department')
      .sort({ appliedDate: -1 })
      .limit(10);
      
      dashboardData.pendingLeaves = pendingLeaves;

      // Get team calendar
      const teamLeaves = await Leave.find({
        userId: { $in: teamUserIds },
        status: 'approved'
      })
      .populate('userId', 'name')
      .sort({ startDate: 1 })
      .limit(10);
      
      dashboardData.leaveCalendar = teamLeaves;
    }

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

// Get manager dashboard data
router.get('/manager', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const userId = req.user.userId;

    // Get team stats
    const teamMembers = await User.find({ managerId: userId, isActive: true });
    const teamMemberIds = teamMembers.map(member => member._id);

    // Get all team leaves
    const teamLeaves = await Leave.find({
      userId: { $in: teamMemberIds }
    })
    .populate('userId', 'name department')
    .sort({ appliedDate: -1 });

    // Calculate stats
    const stats = {
      totalLeaves: teamLeaves.length,
      pending: teamLeaves.filter(l => l.status === 'pending').length,
      approved: teamLeaves.filter(l => l.status === 'approved').length,
      rejected: teamLeaves.filter(l => l.status === 'rejected').length,
      teamMembers: teamMembers.length
    };

    // Get recent approvals
    const recentApprovals = teamLeaves
      .filter(l => l.status === 'approved' || l.status === 'rejected')
      .slice(0, 5);

    res.json({
      stats,
      recentApprovals,
      teamMembers: teamMembers.map(m => ({
        id: m._id,
        name: m.name,
        email: m.email,
        department: m.department
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;