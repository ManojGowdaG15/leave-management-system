const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const userController = require('../controllers/userController');

// All routes protected
router.use(protect);

// Get current user
router.get('/me', userController.getMe);

// Get all users (Admin/HR)
router.get('/', authorize('admin', 'hr'), userController.getAllUsers);

// Get user by ID
router.get('/:id', authorize('admin', 'hr', 'manager'), userController.getUserById);

// Update user (Admin/HR or self)
router.put('/:id', userController.updateUser);

// Delete user (Admin only)
router.delete('/:id', authorize('admin'), userController.deleteUser);

// Get team members (for managers)
router.get('/team/members', authorize('manager'), userController.getTeamMembers);

// Get department users
router.get('/department/:department', authorize('admin', 'hr', 'manager'), userController.getUsersByDepartment);

// Update leave balance (Admin/HR)
router.put('/:id/leave-balance', authorize('admin', 'hr'), userController.updateLeaveBalance);

module.exports = router;