const express = require('express');
const router = express.Router();
const {
    getDashboard,
    getLeaveBalance,
    getPendingLeaves,
} = require('../controllers/employeeController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/dashboard', getDashboard);
router.get('/leave-balance', getLeaveBalance);
router.get('/pending-leaves', getPendingLeaves);

module.exports = router;