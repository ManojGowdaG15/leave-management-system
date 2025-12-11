const LeaveApplication = require('../models/LeaveApplication');
const User = require('../models/User');

// @desc    Apply for leave
// @route   POST /api/leaves/apply
// @access  Private
const applyLeave = async (req, res) => {
    try {
        const { startDate, endDate, leaveType, reason } = req.body;
        const userId = req.user._id;
        
        // Calculate days count
        const start = new Date(startDate);
        const end = new Date(endDate);
        const daysCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        
        // Check leave balance
        const user = await User.findById(userId);
        if (user.leaveBalance[leaveType] < daysCount) {
            return res.status(400).json({ 
                message: `Insufficient ${leaveType} leave balance` 
            });
        }
        
        // Get manager ID
        const manager = await User.findOne({ role: 'manager' });
        
        const leaveApplication = await LeaveApplication.create({
            userId,
            startDate,
            endDate,
            leaveType,
            reason,
            daysCount,
            managerId: manager ? manager._id : null
        });
        
        res.status(201).json(leaveApplication);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's leave history
// @route   GET /api/leaves/history
// @access  Private
const getLeaveHistory = async (req, res) => {
    try {
        const leaves = await LeaveApplication.find({ userId: req.user._id })
            .sort({ appliedDate: -1 })
            .populate('managerId', 'name email');
        
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel leave application
// @route   PUT /api/leaves/cancel/:id
// @access  Private
const cancelLeave = async (req, res) => {
    try {
        const leave = await LeaveApplication.findById(req.params.id);
        
        if (!leave) {
            return res.status(404).json({ message: 'Leave application not found' });
        }
        
        // Check if user owns this leave
        if (leave.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        // Only allow cancellation if status is pending
        if (leave.status !== 'pending') {
            return res.status(400).json({ 
                message: 'Cannot cancel leave that is already processed' 
            });
        }
        
        leave.status = 'cancelled';
        await leave.save();
        
        res.json(leave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { applyLeave, getLeaveHistory, cancelLeave };