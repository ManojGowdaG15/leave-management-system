const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

// All routes protected
router.use(protect);

// Get dashboard data
router.get('/', dashboardController.getDashboard);

// Get statistics
router.get('/stats', dashboardController.getStatistics);

// Get notifications
router.get('/notifications', dashboardController.getNotifications);

// Get pending approvals (for managers)
router.get('/pending-approvals', dashboardController.getPendingApprovals);

module.exports = router;