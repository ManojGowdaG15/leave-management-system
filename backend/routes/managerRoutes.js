const express = require('express');
const router = express.Router();
const {
    getPendingLeaves,
    approveLeave,
    rejectLeave,
    getTeamCalendar,
    getTeamOverview,
    getPendingExpenses,
} = require('../controllers/managerController');
const { protect, isManager } = require('../middleware/auth');

// All routes are protected and require manager role
router.use(protect);
router.use(isManager);

router.get('/pending-leaves', getPendingLeaves);
router.put('/approve-leave/:id', approveLeave);
router.put('/reject-leave/:id', rejectLeave);
router.get('/team-calendar', getTeamCalendar);
router.get('/team-overview', getTeamOverview);
router.get('/pending-expenses', getPendingExpenses);

module.exports = router;