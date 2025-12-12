const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const leaveController = require('../controllers/leaveController');

// All routes protected
router.use(protect);

// Apply for leave
router.post('/', authorize('employee', 'manager', 'hr', 'admin'), leaveController.applyLeave);

// Get my leaves
router.get('/my-leaves', leaveController.getMyLeaves);

// Get all leaves (with filters)
router.get('/', authorize('manager', 'hr', 'admin'), leaveController.getAllLeaves);

// Get leave by ID
router.get('/:id', leaveController.getLeaveById);

// Update leave (only pending leaves)
router.put('/:id', leaveController.updateLeave);

// Cancel leave
router.put('/:id/cancel', leaveController.cancelLeave);

// Approve/Reject leave (Managers/HR/Admin)
router.put('/:id/action', authorize('manager', 'hr', 'admin'), leaveController.leaveAction);

// Get leave statistics
router.get('/stats/summary', leaveController.getLeaveStats);

// Get upcoming leaves
router.get('/upcoming/all', authorize('manager', 'hr', 'admin'), leaveController.getUpcomingLeaves);

// Get leave calendar
router.get('/calendar/:year/:month', leaveController.getLeaveCalendar);

module.exports = router;