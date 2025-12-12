const Leave = require('../models/Leave');
const User = require('../models/User');

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private
exports.applyLeave = async (req, res) => {
  try {
    const {
      leaveType,
      startDate,
      endDate,
      reason,
      isHalfDay,
      halfDayType,
      contactDuringLeave
    } = req.body;

    // Validate required fields
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide leave type, start date, end date, and reason'
      });
    }

    // Check dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be after end date'
      });
    }

    // Check if dates are in past
    if (start < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot apply for leave in past'
      });
    }

    // Calculate number of days
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const numberOfDays = isHalfDay ? 0.5 : diffDays + 1;

    // Check leave balance
    const user = await User.findById(req.user.id);
    
    // Check based on leave type
    let availableLeaves = 0;
    switch (leaveType) {
      case 'Casual':
        availableLeaves = user.casualLeaves.remaining;
        break;
      case 'Sick':
        availableLeaves = user.sickLeaves.remaining;
        break;
      case 'Earned':
        availableLeaves = user.earnedLeaves.remaining;
        break;
      default:
        availableLeaves = user.remainingLeaves;
    }

    if (numberOfDays > availableLeaves) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${leaveType} leave balance. Available: ${availableLeaves} days`
      });
    }

    // Check for overlapping leaves
    const overlappingLeaves = await Leave.find({
      user: req.user.id,
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start }
        }
      ],
      status: { $in: ['pending', 'approved'] }
    });

    if (overlappingLeaves.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You already have a leave during this period'
      });
    }

    // Create leave application
    const leave = await Leave.create({
      user: req.user.id,
      leaveType,
      startDate: start,
      endDate: end,
      numberOfDays,
      reason,
      isHalfDay: isHalfDay || false,
      halfDayType: halfDayType || 'first-half',
      contactDuringLeave
    });

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: leave
    });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get my leaves
// @route   GET /api/leaves/my-leaves
// @access  Private
exports.getMyLeaves = async (req, res) => {
  try {
    const { status, year, month, page = 1, limit = 10 } = req.query;
    
    let query = { user: req.user.id };
    
    // Apply filters
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (year) {
      const yearStart = new Date(`${year}-01-01`);
      const yearEnd = new Date(`${year}-12-31`);
      query.startDate = { $gte: yearStart, $lte: yearEnd };
    }
    
    if (month && year) {
      const monthStart = new Date(`${year}-${month.padStart(2, '0')}-01`);
      const monthEnd = new Date(`${year}-${month.padStart(2, '0')}-31`);
      query.startDate = { $gte: monthStart, $lte: monthEnd };
    }
    
    const skip = (page - 1) * limit;
    
    const leaves = await Leave.find(query)
      .populate('approvedBy', 'name email')
      .sort('-appliedOn')
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Leave.countDocuments(query);
    
    res.json({
      success: true,
      data: leaves,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all leaves (for managers/admin)
// @route   GET /api/leaves
// @access  Private (Manager/HR/Admin)
exports.getAllLeaves = async (req, res) => {
  try {
    const { 
      status, 
      department, 
      startDate, 
      endDate,
      page = 1, 
      limit = 20 
    } = req.query;
    
    let query = {};
    
    // Managers can only see their team's leaves
    if (req.user.role === 'manager') {
      const manager = await User.findById(req.user.id);
      query.user = { $in: manager.teamMembers || [] };
    }
    // HR/Admin can see all
    else if (req.user.role === 'hr' || req.user.role === 'admin') {
      // Can see all
    }
    // Employees should use /my-leaves
    else {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    // Apply filters
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (department) {
      const usersInDept = await User.find({ department }).select('_id');
      query.user = { ...query.user, $in: usersInDept.map(u => u._id) };
    }
    
    if (startDate && endDate) {
      query.startDate = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }
    
    const skip = (page - 1) * limit;
    
    const leaves = await Leave.find(query)
      .populate('user', 'name email department designation employeeId')
      .populate('approvedBy', 'name email')
      .sort('-appliedOn')
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Leave.countDocuments(query);
    
    res.json({
      success: true,
      data: leaves,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get leave by ID
// @route   GET /api/leaves/:id
// @access  Private
exports.getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('user', 'name email department designation employeeId')
      .populate('approvedBy', 'name email')
      .populate('workHandoverTo', 'name email');
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }
    
    // Check permission
    if (leave.user._id.toString() !== req.user.id && 
        req.user.role !== 'manager' && 
        req.user.role !== 'hr' && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this leave'
      });
    }
    
    res.json({
      success: true,
      data: leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update leave (only pending leaves)
// @route   PUT /api/leaves/:id
// @access  Private
exports.updateLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }
    
    // Check permission
    if (leave.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this leave'
      });
    }
    
    // Only pending leaves can be updated
    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending leaves can be updated'
      });
    }
    
    // Update fields
    const updatableFields = ['reason', 'contactDuringLeave', 'alternateContact'];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        leave[field] = req.body[field];
      }
    });
    
    await leave.save();
    
    res.json({
      success: true,
      message: 'Leave updated successfully',
      data: leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel leave
// @route   PUT /api/leaves/:id/cancel
// @access  Private
exports.cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }
    
    // Check permission
    if (leave.user.toString() !== req.user.id && 
        req.user.role !== 'hr' && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this leave'
      });
    }
    
    // Only pending or approved leaves can be cancelled
    if (!['pending', 'approved'].includes(leave.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only pending or approved leaves can be cancelled'
      });
    }
    
    // Update status
    leave.status = 'cancelled';
    await leave.save();
    
    // If approved leave was cancelled, restore leave balance
    if (leave.status === 'approved') {
      const user = await User.findById(leave.user);
      
      // Restore leave balance based on type
      switch (leave.leaveType) {
        case 'Casual':
          user.casualLeaves.taken -= leave.numberOfDays;
          break;
        case 'Sick':
          user.sickLeaves.taken -= leave.numberOfDays;
          break;
        case 'Earned':
          user.earnedLeaves.taken -= leave.numberOfDays;
          break;
      }
      
      user.leavesTaken -= leave.numberOfDays;
      await user.save();
    }
    
    res.json({
      success: true,
      message: 'Leave cancelled successfully',
      data: leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve/Reject leave
// @route   PUT /api/leaves/:id/action
// @access  Private (Manager/HR/Admin)
exports.leaveAction = async (req, res) => {
  try {
    const { action, comments } = req.body;
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be either "approve" or "reject"'
      });
    }
    
    const leave = await Leave.findById(req.params.id)
      .populate('user', 'name email department');
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }
    
    // Check permission
    let hasPermission = false;
    
    if (req.user.role === 'admin' || req.user.role === 'hr') {
      hasPermission = true;
    } 
    else if (req.user.role === 'manager') {
      // Check if this leave belongs to manager's team
      const manager = await User.findById(req.user.id);
      if (manager.teamMembers && manager.teamMembers.includes(leave.user._id)) {
        hasPermission = true;
      }
    }
    
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to perform this action'
      });
    }
    
    // Only pending leaves can be acted upon
    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending leaves can be approved/rejected'
      });
    }
    
    // Update leave
    leave.status = action === 'approve' ? 'approved' : 'rejected';
    leave.approvedBy = req.user.id;
    leave.approvedAt = Date.now();
    
    if (action === 'reject' && comments) {
      leave.rejectionReason = comments;
    }
    
    await leave.save();
    
    // If approved, update user's leave balance
    if (action === 'approve') {
      const user = await User.findById(leave.user._id);
      
      // Update leave balance based on type
      switch (leave.leaveType) {
        case 'Casual':
          user.casualLeaves.taken += leave.numberOfDays;
          user.casualLeaves.remaining = user.casualLeaves.total - user.casualLeaves.taken;
          break;
        case 'Sick':
          user.sickLeaves.taken += leave.numberOfDays;
          user.sickLeaves.remaining = user.sickLeaves.total - user.sickLeaves.taken;
          break;
        case 'Earned':
          user.earnedLeaves.taken += leave.numberOfDays;
          user.earnedLeaves.remaining = user.earnedLeaves.total - user.earnedLeaves.taken;
          break;
      }
      
      user.leavesTaken += leave.numberOfDays;
      user.remainingLeaves = user.totalLeaves - user.leavesTaken;
      await user.save();
    }
    
    res.json({
      success: true,
      message: `Leave ${action}d successfully`,
      data: leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get leave statistics
// @route   GET /api/leaves/stats/summary
// @access  Private
exports.getLeaveStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // For employees, show their own stats
    let matchQuery = { user: req.user.id };
    
    // For managers, show team stats
    if (req.user.role === 'manager') {
      const manager = await User.findById(req.user.id);
      matchQuery.user = { $in: manager.teamMembers || [] };
    }
    // For HR/Admin, show all stats
    else if (req.user.role === 'hr' || req.user.role === 'admin') {
      matchQuery = {};
    }
    
    // Get leave counts by status
    const stats = await Leave.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDays: { $sum: '$numberOfDays' }
        }
      }
    ]);
    
    // Get leave counts by type
    const typeStats = await Leave.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$leaveType',
          count: { $sum: 1 },
          totalDays: { $sum: '$numberOfDays' }
        }
      }
    ]);
    
    // Get monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyTrend = await Leave.aggregate([
      {
        $match: {
          ...matchQuery,
          appliedOn: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$appliedOn' },
            month: { $month: '$appliedOn' }
          },
          count: { $sum: 1 },
          totalDays: { $sum: '$numberOfDays' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);
    
    res.json({
      success: true,
      data: {
        userStats: {
          totalLeaves: user.totalLeaves,
          leavesTaken: user.leavesTaken,
          remainingLeaves: user.remainingLeaves,
          casualLeaves: user.casualLeaves,
          sickLeaves: user.sickLeaves,
          earnedLeaves: user.earnedLeaves
        },
        leaveStats: stats.reduce((acc, curr) => {
          acc[curr._id] = curr;
          return acc;
        }, {}),
        typeStats: typeStats.reduce((acc, curr) => {
          acc[curr._id] = curr;
          return acc;
        }, {}),
        monthlyTrend
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get upcoming leaves
// @route   GET /api/leaves/upcoming/all
// @access  Private (Manager/HR/Admin)
exports.getUpcomingLeaves = async (req, res) => {
  try {
    let query = {
      startDate: { $gte: new Date() },
      status: 'approved'
    };
    
    // For managers, show only team leaves
    if (req.user.role === 'manager') {
      const manager = await User.findById(req.user.id);
      query.user = { $in: manager.teamMembers || [] };
    }
    // Employees not authorized
    else if (req.user.role === 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    const upcomingLeaves = await Leave.find(query)
      .populate('user', 'name email department designation')
      .sort('startDate')
      .limit(20);
    
    res.json({
      success: true,
      data: upcomingLeaves
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get leave calendar
// @route   GET /api/leaves/calendar/:year/:month
// @access  Private
exports.getLeaveCalendar = async (req, res) => {
  try {
    const { year, month } = req.params;
    
    const startDate = new Date(`${year}-${month.padStart(2, '0')}-01`);
    const endDate = new Date(`${year}-${month.padStart(2, '0')}-31`);
    
    let query = {
      $or: [
        {
          startDate: { $lte: endDate },
          endDate: { $gte: startDate }
        }
      ],
      status: 'approved'
    };
    
    // For employees, show only their leaves
    if (req.user.role === 'employee') {
      query.user = req.user.id;
    }
    // For managers, show team leaves
    else if (req.user.role === 'manager') {
      const manager = await User.findById(req.user.id);
      query.user = { $in: manager.teamMembers || [] };
    }
    // For HR/Admin, show all
    // else show all
    
    const leaves = await Leave.find(query)
      .populate('user', 'name email department')
      .sort('startDate');
    
    res.json({
      success: true,
      data: leaves
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};