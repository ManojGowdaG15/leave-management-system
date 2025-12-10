const express = require('express');
const router = express.Router();
const LeaveApplication = require('../models/LeaveApplication');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/leave/balance
// @desc    Get leave balance for current user
// @access  Private
router.get('/balance', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({
            casual_leaves: user.leave_balance.casual_leaves,
            sick_leaves: user.leave_balance.sick_leaves,
            earned_leaves: user.leave_balance.earned_leaves
        });
    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   POST /api/leave/apply
// @desc    Apply for leave
// @access  Private
router.post('/apply', protect, async (req, res) => {
    try {
        const { start_date, end_date, leave_type, reason } = req.body;
        
        // Validation
        if (!start_date || !end_date || !leave_type || !reason) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        const start = new Date(start_date);
        const end = new Date(end_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (start < today) {
            return res.status(400).json({ error: 'Start date cannot be in the past' });
        }
        
        if (end < start) {
            return res.status(400).json({ error: 'End date must be after start date' });
        }
        
        // Calculate leave days
        const leaveDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        
        // Get user with current leave balance
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Check leave balance
        const balanceField = `${leave_type}_leaves`;
        if (user.leave_balance[balanceField] < leaveDays) {
            return res.status(400).json({ 
                error: `Insufficient ${leave_type} leave balance. Available: ${user.leave_balance[balanceField]}, Required: ${leaveDays}` 
            });
        }
        
        // Create leave application
        const leaveApplication = new LeaveApplication({
            user_id: user._id,
            user_name: user.name,
            start_date: start,
            end_date: end,
            leave_type,
            reason,
            leave_days: leaveDays,
            year: start.getFullYear()
        });
        
        await leaveApplication.save();
        
        res.status(201).json({
            success: true,
            message: 'Leave application submitted successfully',
            data: leaveApplication
        });
        
    } catch (error) {
        console.error('Apply leave error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/leave/history
// @desc    Get leave history for current user
// @access  Private
router.get('/history', protect, async (req, res) => {
    try {
        const applications = await LeaveApplication.find({ 
            user_id: req.user.id 
        }).sort({ applied_date: -1 });
        
        res.json({
            success: true,
            count: applications.length,
            data: applications
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   PUT /api/leave/cancel/:id
// @desc    Cancel a pending leave application
// @access  Private
router.put('/cancel/:id', protect, async (req, res) => {
    try {
        const application = await LeaveApplication.findOne({
            _id: req.params.id,
            user_id: req.user.id,
            status: 'pending'
        });
        
        if (!application) {
            return res.status(400).json({ 
                error: 'Cannot cancel this leave application. Either it does not exist, is not yours, or is not pending.' 
            });
        }
        
        application.status = 'cancelled';
        await application.save();
        
        res.json({
            success: true,
            message: 'Leave application cancelled successfully',
            data: application
        });
    } catch (error) {
        console.error('Cancel leave error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/leave/pending
// @desc    Get pending leave requests for manager's team
// @access  Private (Manager/Admin only)
router.get('/pending', protect, authorize('manager', 'admin'), async (req, res) => {
    try {
        // Get all employees under this manager
        const employees = await User.find({ 
            $or: [
                { manager_id: req.user.id },
                { _id: { $in: await getAssignedEmployees(req.user.id) } }
            ]
        });
        
        const employeeIds = employees.map(emp => emp._id);
        
        if (employeeIds.length === 0) {
            return res.json({
                success: true,
                count: 0,
                data: []
            });
        }
        
        const pendingLeaves = await LeaveApplication.find({
            user_id: { $in: employeeIds },
            status: 'pending'
        }).sort({ applied_date: -1 });
        
        res.json({
            success: true,
            count: pendingLeaves.length,
            data: pendingLeaves
        });
    } catch (error) {
        console.error('Get pending leaves error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Helper function to get assigned employees
async function getAssignedEmployees(managerId) {
    // This would come from TeamAssignment model
    // For now, return empty array
    return [];
}

// @route   PUT /api/leave/approve/:id
// @desc    Approve or reject a leave application
// @access  Private (Manager/Admin only)
router.put('/approve/:id', protect, authorize('manager', 'admin'), async (req, res) => {
    try {
        const { status, manager_comments } = req.body;
        
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be "approved" or "rejected"' });
        }
        
        const application = await LeaveApplication.findById(req.params.id);
        if (!application || application.status !== 'pending') {
            return res.status(404).json({ 
                error: 'Leave application not found or already processed' 
            });
        }
        
        // Check if manager can approve this leave
        // Get the employee
        const employee = await User.findById(application.user_id);
        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        
        // Check if employee reports to this manager
        const canApprove = employee.manager_id && 
                          employee.manager_id.toString() === req.user.id;
        
        if (!canApprove && req.user.role !== 'admin') {
            return res.status(403).json({ 
                error: 'You can only approve leaves for your team members' 
            });
        }
        
        // Update leave application
        application.status = status;
        application.manager_comments = manager_comments || '';
        application.approved_date = new Date();
        application.approved_by = req.user.id;
        application.approved_by_name = req.user.name;
        
        await application.save();
        
        // Update leave balance if approved
        if (status === 'approved') {
            const user = await User.findById(application.user_id);
            if (user) {
                const balanceField = `${application.leave_type}_leaves`;
                user.leave_balance[balanceField] -= application.leave_days;
                user.leave_balance.updated_at = new Date();
                await user.save();
            }
        }
        
        res.json({
            success: true,
            message: `Leave application ${status} successfully`,
            data: application
        });
    } catch (error) {
        console.error('Approve leave error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/leave/team-calendar
// @desc    Get team leave calendar for manager
// @access  Private (Manager/Admin only)
router.get('/team-calendar', protect, authorize('manager', 'admin'), async (req, res) => {
    try {
        // Get all employees under this manager
        const employees = await User.find({ 
            $or: [
                { manager_id: req.user.id },
                { _id: { $in: await getAssignedEmployees(req.user.id) } }
            ]
        });
        
        const employeeIds = employees.map(emp => emp._id);
        
        if (employeeIds.length === 0) {
            return res.json({
                success: true,
                data: []
            });
        }
        
        const calendarData = await LeaveApplication.find({
            user_id: { $in: employeeIds },
            status: { $in: ['approved', 'pending'] }
        })
        .select('user_name start_date end_date leave_type status')
        .sort({ start_date: 1 });
        
        // Format for calendar view
        const formattedData = calendarData.map(leave => ({
            id: leave._id,
            title: `${leave.user_name} - ${leave.leave_type}`,
            start: leave.start_date,
            end: new Date(new Date(leave.end_date).getTime() + 24 * 60 * 60 * 1000), // Add 1 day for full day event
            backgroundColor: leave.status === 'approved' ? '#10B981' : '#F59E0B', // Green for approved, yellow for pending
            borderColor: leave.status === 'approved' ? '#10B981' : '#F59E0B',
            textColor: '#FFFFFF',
            extendedProps: {
                leave_type: leave.leave_type,
                status: leave.status
            }
        }));
        
        res.json({
            success: true,
            data: formattedData
        });
    } catch (error) {
        console.error('Get team calendar error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;