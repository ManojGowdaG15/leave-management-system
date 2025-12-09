const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
    try {
        const { employeeId, name, email, password, role, department } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { employeeId }] });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const user = new User({
            employeeId,
            name,
            email,
            password: hashedPassword,
            role: role || 'employee',
            department
        });
        
        await user.save();
        
        // Create token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            token,
            user: {
                id: user._id,
                employeeId: user.employeeId,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                remainingLeaveDays: user.remainingLeaveDays
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        // Create token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );
        
        res.json({
            token,
            user: {
                id: user._id,
                employeeId: user.employeeId,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                remainingLeaveDays: user.remainingLeaveDays
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Find user
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Seed demo users (optional endpoint)
router.post('/seed-demo', async (req, res) => {
    try {
        // Create demo departments first
        const Department = require('../models/Department');
        
        const demoUsers = [
            {
                employeeId: 'EMP001',
                name: 'John Doe',
                email: 'emp@example.com',
                password: 'password',
                role: 'employee',
                department: null
            },
            {
                employeeId: 'MGR001',
                name: 'Jane Smith',
                email: 'manager@example.com',
                password: 'password',
                role: 'manager',
                department: null
            },
            {
                employeeId: 'ADM001',
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'password',
                role: 'admin',
                department: null
            }
        ];
        
        const createdUsers = [];
        
        for (const userData of demoUsers) {
            // Check if user exists
            const existingUser = await User.findOne({ email: userData.email });
            
            if (!existingUser) {
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                const user = new User({
                    ...userData,
                    password: hashedPassword
                });
                await user.save();
                createdUsers.push(user);
            }
        }
        
        res.json({
            message: 'Demo users created',
            users: createdUsers
        });
    } catch (error) {
        console.error('Seed error:', error);
        res.status(500).json({ error: 'Failed to seed demo users' });
    }
});

module.exports = router;