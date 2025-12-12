const User = require('../models/User');
const Leave = require('../models/Leave');

// @desc    Get dashboard data
// @route   GET /api/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let dashboardData = {
      user: {},
      leaves: {},
      team: {},
      notifications: []
    };
    
    // Get user details
    const user = await User.findById(userId)
      .select('-password')
      .populate('manager', 'name email')
      .populate('teamMembers', 'name email department');
    
    dashboardData.user = user;
    
    // Get user's leaves
    const userLeaves = await Leave.find({ user: userId })
      .sort('-appliedOn')
      .limit(5);
    
    dashboardData.leaves.recent = userLeaves;
    
    // Get leave statistics
    const leaveStats = await Leave.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          days: { $sum: '$duration' }
        }
      }
    ]);
    
    dashboardData.leaves.stats = leaveStats;
    
    // Get pending approvals (for managers/admins)
    if (userRole === 'manager' || userRole === 'admin') {
      let query = { status: 'pending' };
      
      if (userRole === 'manager') {
        const teamMemberIds = user.teamMembers.map(member => member._id);
        query.user = { $in: teamMemberIds };
      }
      
      const pendingLeaves = await Leave.find(query)
        .populate('user', 'name email department')
        .sort('appliedOn')
        .limit(10);
      
      dashboardData.pendingApprovals = pendingLeaves;
    }
    
    // Get team statistics (for managers)
    if (userRole === 'manager' && user.teamMembers.length > 0) {
      const teamStats = await Leave.aggregate([
        {
          $match: {
            user: { $in: user.teamMembers.map(m => m._id) },
            startDate: { $gte: new Date(new Date().getFullYear(), 0, 1) }
          }
        },
        {
          $group: {
            _id: '$user',
            totalLeaves: { $sum: 1 },
            totalDays: { $sum: '$duration' }
          }
        }
      ]);
      
      dashboardData.team.stats = teamStats;
    }
    
    // Get upcoming leaves
    const upcomingLeaves = await Leave.find({
      user: userRole === 'employee' ? userId : { $in: user.teamMembers?.map(m => m._id) || [] },
      startDate: { $gte: new Date() },
      status: 'approved'
    })
    .populate('user', 'name department')
    .sort('startDate')
    .limit(5);
    
    dashboardData.upcomingLeaves = upcomingLeaves;
    
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};