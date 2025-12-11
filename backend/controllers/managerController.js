const LeaveApplication = require('../models/LeaveApplication');
const User = require('../models/User');

// @desc    Get pending leave requests
// @route   GET /api/manager/pending-leaves
// @access  Private/Manager
const getPendingLeaves = async (req, res) => {
    try {
        const leaves = await LeaveApplication.find({ 
            status: 'pending',
            managerId: req.user._id 
        })
        .populate('userId', 'name email department')
        .sort({ appliedDate: -1 });
        
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve leave request
// @route   PUT /api/manager/approve-leave/:id
// @access  Private/Manager
const approveLeave = async (req, res) => {
    try {
        const { comments } = req.body;
        const leave = await LeaveApplication.findById(req.params.id);
        
        if (!leave) {
            return res.status(404).json({ message: 'Leave application not found' });
        }
        
        // Update leave status
        leave.status = 'approved';
        leave.managerComments = comments || 'Approved';
        await leave.save();
        
        // Deduct from user's leave balance
        const user = await User.findById(leave.userId);
        user.leaveBalance[leave.leaveType] -= leave.daysCount;
        await user.save();
        
        res.json(leave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject leave request
// @route   PUT /api/manager/reject-leave/:id
// @access  Private/Manager
const rejectLeave = async (req, res) => {
    try {
        const { comments } = req.body;
        const leave = await LeaveApplication.findById(req.params.id);
        
        if (!leave) {
            return res.status(404).json({ message: 'Leave application not found' });
        }
        
        leave.status = 'rejected';
        leave.managerComments = comments || 'Rejected';
        await leave.save();
        
        res.json(leave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get team leave calendar
// @route   GET /api/manager/team-calendar
// @access  Private/Manager
const getTeamCalendar = async (req, res) => {
    try {
        // Get all employees managed by this manager
        const employees = await User.find({ 
            managerId: req.user._id,
            role: 'employee' 
        }).select('_id');
        
        const employeeIds = employees.map(emp => emp._id);
        
        const leaves = await LeaveApplication.find({
            userId: { $in: employeeIds },
            status: 'approved'
        })
        .populate('userId', 'name')
        .select('startDate endDate leaveType userId');
        
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    getPendingLeaves, 
    approveLeave, 
    rejectLeave, 
    getTeamCalendar 
};