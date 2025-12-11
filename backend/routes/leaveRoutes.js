const express = require('express');
const router = express.Router();
const {
    applyLeave,
    getLeaveHistory,
    cancelLeave,
    getLeaveById,
} = require('../controllers/leaveController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.post('/apply', applyLeave);
router.get('/history', getLeaveHistory);
router.put('/cancel/:id', cancelLeave);
router.get('/:id', getLeaveById);

module.exports = router;