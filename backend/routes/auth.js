const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const LeaveBalance = require('../models/LeaveBalance');
const { authMiddleware } = require('../middleware/auth');

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Seed initial users (for testing)
router.post('/seed', async (req, res) => {
  try {
    await User.deleteMany({});
    await LeaveBalance.deleteMany({});

    const manager = await User.create({
      name: 'John Manager',
      email: 'manager@company.com',
      password: 'manager123',
      role: 'manager'
    });

    await LeaveBalance.create({
      userId: manager._id,
      casualLeaves: 12,
      sickLeaves: 12,
      earnedLeaves: 15
    });

    const employee1 = await User.create({
      name: 'Alice Employee',
      email: 'alice@company.com',
      password: 'employee123',
      role: 'employee',
      managerId: manager._id
    });

    const employee2 = await User.create({
      name: 'Bob Employee',
      email: 'bob@company.com',
      password: 'employee123',
      role: 'employee',
      managerId: manager._id
    });

    await LeaveBalance.create({
      userId: employee1._id,
      casualLeaves: 12,
      sickLeaves: 12,
      earnedLeaves: 15
    });

    await LeaveBalance.create({
      userId: employee2._id,
      casualLeaves: 12,
      sickLeaves: 12,
      earnedLeaves: 15
    });

    res.json({ 
      message: 'Database seeded successfully',
      users: {
        manager: { email: 'manager@company.com', password: 'manager123' },
        employee1: { email: 'alice@company.com', password: 'employee123' },
        employee2: { email: 'bob@company.com', password: 'employee123' }
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Error seeding database' });
  }
});

module.exports = router;