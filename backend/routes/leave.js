const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Apply for leave
router.post('/', auth, async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;
        
        // Calculate total days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        
        // Check if user has enough leave days
        const user = await User.findById(req.userId);
        if (user.remainingLeaveDays < totalDays) {
            return res.status(400).json({ 
                error: `Insufficient leave balance. You have ${user.remainingLeaveDays} days remaining, but need ${totalDays} days.` 
            });
        }
        
        // Create leave request
        const leave = new Leave({
            employee: req.userId,
            leaveType,
            startDate: start,
            endDate: end,
            totalDays,
            reason,
            status: 'pending'
        });
        
        await leave.save();
        
        // Populate employee details for response
        const populatedLeave = await Leave.findById(leave._id).populate('employee', 'name email');
        
        res.status(201).json({
            message: 'Leave request submitted successfully',
            leave: populatedLeave
        });
    } catch (error) {
        console.error('Error applying for leave:', error);
        res.status(500).json({ error: 'Failed to submit leave request' });
    }
});

// Get user's leaves
router.get('/my-leaves', auth, async (req, res) => {
    try {
        const leaves = await Leave.find({ employee: req.userId })
            .populate('employee', 'name email employeeId')
            .populate('approvedBy', 'name')
            .sort({ createdAt: -1 });
        
        res.json(leaves);
    } catch (error) {
        console.error('Error fetching leaves:', error);
        res.status(500).json({ error: 'Failed to fetch leave requests' });
    }
});

// Get all leaves (for managers/admins)
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        let query = {};
        if (user.role === 'manager') {
            // Get leaves for employees in manager's department
            const departmentEmployees = await User.find({ 
                department: user.department 
            }).select('_id');
            
            const employeeIds = departmentEmployees.map(emp => emp._id);
            query = { employee: { $in: employeeIds } };
        }
        
        const leaves = await Leave.find(query)
            .populate('employee', 'name email employeeId department')
            .populate('approvedBy', 'name')
            .sort({ createdAt: -1 });
        
        res.json(leaves);
    } catch (error) {
        console.error('Error fetching all leaves:', error);
        res.status(500).json({ error: 'Failed to fetch leave requests' });
    }
});

// Get leave by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id)
            .populate('employee', 'name email employeeId')
            .populate('approvedBy', 'name');
        
        if (!leave) {
            return res.status(404).json({ error: 'Leave request not found' });
        }
        
        res.json(leave);
    } catch (error) {
        console.error('Error fetching leave:', error);
        res.status(500).json({ error: 'Failed to fetch leave request' });
    }
});

// Update leave status (approve/reject)
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status, comments } = req.body;
        const validStatuses = ['pending', 'approved', 'rejected', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const leave = await Leave.findById(req.params.id);
        if (!leave) {
            return res.status(404).json({ error: 'Leave request not found' });
        }
        
        // Check authorization
        const user = await User.findById(req.userId);
        if (user.role === 'employee' && req.userId !== leave.employee.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this leave' });
        }
        
        // Update leave
        leave.status = status;
        if (comments) leave.comments = comments;
        
        if (status === 'approved' || status === 'rejected') {
            leave.approvedBy = req.userId;
            leave.approvedDate = new Date();
        }
        
        await leave.save();
        
        // Update user's leave balance if approved
        if (status === 'approved' && leave.status !== 'approved') {
            await User.findByIdAndUpdate(leave.employee, {
                $inc: { remainingLeaveDays: -leave.totalDays }
            });
        }
        
        // Populate the updated leave
        const populatedLeave = await Leave.findById(leave._id)
            .populate('employee', 'name email employeeId')
            .populate('approvedBy', 'name');
        
        res.json({
            message: `Leave request ${status} successfully`,
            leave: populatedLeave
        });
    } catch (error) {
        console.error('Error updating leave status:', error);
        res.status(500).json({ error: 'Failed to update leave request' });
    }
});

// Cancel leave
router.patch('/:id/cancel', auth, async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);
        
        if (!leave) {
            return res.status(404).json({ error: 'Leave request not found' });
        }
        
        // Only employee can cancel their own leave
        if (leave.employee.toString() !== req.userId) {
            return res.status(403).json({ error: 'Not authorized to cancel this leave' });
        }
        
        // Can only cancel pending or approved leaves
        if (!['pending', 'approved'].includes(leave.status)) {
            return res.status(400).json({ error: 'Cannot cancel a leave with current status' });
        }
        
        // If approved, return leave days to balance
        if (leave.status === 'approved') {
            await User.findByIdAndUpdate(leave.employee, {
                $inc: { remainingLeaveDays: leave.totalDays }
            });
        }
        
        leave.status = 'cancelled';
        await leave.save();
        
        const populatedLeave = await Leave.findById(leave._id)
            .populate('employee', 'name email employeeId');
        
        res.json({
            message: 'Leave request cancelled successfully',
            leave: populatedLeave
        });
    } catch (error) {
        console.error('Error cancelling leave:', error);
        res.status(500).json({ error: 'Failed to cancel leave request' });
    }
});

// Delete leave (admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const leave = await Leave.findByIdAndDelete(req.params.id);
        
        if (!leave) {
            return res.status(404).json({ error: 'Leave request not found' });
        }
        
        res.json({ message: 'Leave request deleted successfully' });
    } catch (error) {
        console.error('Error deleting leave:', error);
        res.status(500).json({ error: 'Failed to delete leave request' });
    }
});

module.exports = router;