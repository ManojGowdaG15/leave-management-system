const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Leave = require('../models/Leave');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Get all users (admin/manager only)
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        let query = {};
        if (user.role === 'manager') {
            // Managers can only see users in their department
            query = { department: user.department };
        }
        
        const users = await User.find(query)
            .select('-password')
            .populate('department', 'name')
            .sort({ createdAt: -1 });
        
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .select('-password')
            .populate('department', 'name');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Get user's leave statistics
        const leaves = await Leave.find({ employee: req.userId });
        const stats = {
            totalLeaves: leaves.length,
            pending: leaves.filter(l => l.status === 'pending').length,
            approved: leaves.filter(l => l.status === 'approved').length,
            rejected: leaves.filter(l => l.status === 'rejected').length,
            totalDaysTaken: leaves
                .filter(l => l.status === 'approved')
                .reduce((sum, l) => sum + l.totalDays, 0)
        };
        
        res.json({
            user,
            stats
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('department', 'name');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Check authorization
        const currentUser = await User.findById(req.userId);
        if (currentUser.role === 'employee' && req.params.id !== req.userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        
        // Get user's leaves
        const leaves = await Leave.find({ employee: req.params.id })
            .sort({ createdAt: -1 })
            .limit(10);
        
        res.json({
            user,
            recentLeaves: leaves
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, phone, position } = req.body;
        
        const updates = {};
        if (name) updates.name = name;
        if (phone) updates.phone = phone;
        if (position) updates.position = position;
        
        const user = await User.findByIdAndUpdate(
            req.userId,
            updates,
            { new: true, runValidators: true }
        ).select('-password');
        
        res.json({
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Update user (admin only)
router.put('/:id', auth, async (req, res) => {
    try {
        const currentUser = await User.findById(req.userId);
        if (currentUser.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const { name, email, role, department, remainingLeaveDays } = req.body;
        
        const updates = {};
        if (name) updates.name = name;
        if (email) updates.email = email;
        if (role) updates.role = role;
        if (department) updates.department = department;
        if (remainingLeaveDays !== undefined) updates.remainingLeaveDays = remainingLeaveDays;
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');
        
        res.json({
            message: 'User updated successfully',
            user
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Change password
router.post('/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const user = await User.findById(req.userId);
        
        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        user.password = hashedPassword;
        await user.save();
        
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Get team members (for managers)
router.get('/team/members', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        if (user.role !== 'manager' && user.role !== 'admin') {
            return res.status(403).json({ error: 'Manager access required' });
        }
        
        let query = {};
        if (user.role === 'manager') {
            query = { department: user.department, _id: { $ne: user._id } };
        }
        
        const teamMembers = await User.find(query)
            .select('-password')
            .populate('department', 'name')
            .sort({ name: 1 });
        
        // Get leave statistics for each team member
        const membersWithStats = await Promise.all(
            teamMembers.map(async (member) => {
                const leaves = await Leave.find({ employee: member._id });
                const stats = {
                    totalLeaves: leaves.length,
                    pending: leaves.filter(l => l.status === 'pending').length,
                    approved: leaves.filter(l => l.status === 'approved').length,
                    rejected: leaves.filter(l => l.status === 'rejected').length
                };
                
                return {
                    ...member.toObject(),
                    stats
                };
            })
        );
        
        res.json(membersWithStats);
    } catch (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({ error: 'Failed to fetch team members' });
    }
});

module.exports = router;