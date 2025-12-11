const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if user exists
        const user = await User.findOne({ email });
        
        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                token: generateToken(user._id),
                leaveBalance: user.leaveBalance
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create sample users (for testing)
// @route   POST /api/auth/create-sample
// @access  Public
const createSampleUsers = async (req, res) => {
    try {
        // Create manager
        const manager = await User.create({
            name: 'John Manager',
            email: 'manager@test.com',
            password: 'manager123',
            role: 'manager',
            department: 'Management'
        });
        
        // Create employee
        const employee = await User.create({
            name: 'Jane Employee',
            email: 'employee@test.com',
            password: 'employee123',
            role: 'employee',
            managerId: manager._id,
            department: 'Engineering'
        });
        
        res.json({ 
            message: 'Sample users created',
            manager: { email: manager.email, password: 'manager123' },
            employee: { email: employee.email, password: 'employee123' }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { login, createSampleUsers };