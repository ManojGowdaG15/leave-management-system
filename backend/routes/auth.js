const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const authController = require('../controllers/authController');

// Public routes
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/update-profile', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);

// Admin/HR only routes
router.post('/register', protect, authorize('admin', 'hr'), authController.register);

module.exports = router;