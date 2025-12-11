const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { validateEmail, validatePassword } = require('../utils/validators');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
    const { name, email, password, role, department } = req.body;

    // Validate email
    if (!validateEmail(email)) {
        res.status(400);
        throw new Error('Please enter a valid email');
    }

    // Validate password
    if (!validatePassword(password)) {
        res.status(400);
        throw new Error('Password must be at least 6 characters');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'employee',
        department: department || 'Engineering',
    });

    if (user) {
        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                token: user.getSignedJwtToken(),
                leaveBalance: user.leaveBalance,
            },
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    res.json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            token: user.getSignedJwtToken(),
            leaveBalance: user.leaveBalance,
        },
    });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    res.json({
        success: true,
        data: user,
    });
});

// @desc    Create sample users for testing
// @route   POST /api/auth/create-sample
// @access  Public
const createSampleUsers = asyncHandler(async (req, res) => {
    // Delete existing sample users
    await User.deleteMany({ 
        email: { 
            $in: ['manager@test.com', 'employee@test.com', 'employee2@test.com'] 
        } 
    });

    // Create manager
    const manager = await User.create({
        name: 'John Manager',
        email: 'manager@test.com',
        password: 'manager123',
        role: 'manager',
        department: 'Management',
    });

    // Create employees
    const employee1 = await User.create({
        name: 'Jane Employee',
        email: 'employee@test.com',
        password: 'employee123',
        role: 'employee',
        managerId: manager._id,
        department: 'Engineering',
    });

    const employee2 = await User.create({
        name: 'Bob Developer',
        email: 'employee2@test.com',
        password: 'employee123',
        role: 'employee',
        managerId: manager._id,
        department: 'Engineering',
    });

    res.json({
        success: true,
        message: 'Sample users created successfully',
        data: {
            manager: {
                email: 'manager@test.com',
                password: 'manager123',
                token: manager.getSignedJwtToken(),
            },
            employees: [
                {
                    email: 'employee@test.com',
                    password: 'employee123',
                    token: employee1.getSignedJwtToken(),
                },
                {
                    email: 'employee2@test.com',
                    password: 'employee123',
                    token: employee2.getSignedJwtToken(),
                },
            ],
        },
    });
});

module.exports = {
    register,
    login,
    getMe,
    createSampleUsers,
};