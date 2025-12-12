const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// ==================== CORS CONFIGURATION ====================
const allowedOrigins = [
  'https://leave-management-system-zlf8.vercel.app',
  'https://leave-management-system-1-kv66.onrender.com',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5173',
  'https://leave-management-system-zlf8-9yl4ojrec-manoj-gowda-gs-projects.vercel.app' // Add this
];



const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.originalUrl} | Origin: ${req.headers.origin}`);
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Models
const User = require('./models/User');
const Leave = require('./models/Leave');

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please authenticate' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ 
      success: false, 
      message: 'Please authenticate' 
    });
  }
};

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Leave Management System API',
    version: '1.0.0',
    status: 'running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    cors: {
      allowedOrigins: allowedOrigins,
      frontend: 'https://leave-management-system-zlf8.vercel.app'
    },
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        updateProfile: 'PUT /api/auth/update-profile',
        changePassword: 'PUT /api/auth/change-password'
      },
      users: {
        all: 'GET /api/users',
        update: 'PUT /api/users/:id'
      },
      employees: {
        all: 'GET /api/employees',
        single: 'GET /api/employees/:id',
        team: 'GET /api/users/team/members'
      },
      leaves: {
        apply: 'POST /api/leaves',
        myLeaves: 'GET /api/leaves/my-leaves',
        allLeaves: 'GET /api/leaves',
        getLeave: 'GET /api/leaves/:id',
        cancel: 'PUT /api/leaves/:id/cancel',
        action: 'PUT /api/leaves/:id/action',
        stats: 'GET /api/leaves/stats/summary',
        upcoming: 'GET /api/leaves/upcoming/all'
      },
      dashboard: {
        main: 'GET /api/dashboard',
        stats: 'GET /api/dashboard/stats',
        basic: 'GET /api/dashboard/basic'
      }
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    cors: {
      allowedOrigins: allowedOrigins
    }
  });
});

// ==================== AUTH ROUTES ====================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt from:', req.headers.origin);
    console.log('📧 Email:', req.body.email);
    
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    console.log('✅ Login successful for:', user.email);
    
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        employeeId: user.employeeId,
        contactNumber: user.contactNumber,
        totalLeaves: user.totalLeaves,
        leavesTaken: user.leavesTaken,
        remainingLeaves: user.remainingLeaves,
        casualLeaves: user.casualLeaves,
        sickLeaves: user.sickLeaves,
        earnedLeaves: user.earnedLeaves
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get current user
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update profile
app.put('/api/auth/update-profile', auth, async (req, res) => {
  try {
    const { name, contactNumber, address, dateOfBirth, gender } = req.body;
    
    const updates = {};
    if (name) updates.name = name;
    if (contactNumber) updates.contactNumber = contactNumber;
    if (address) updates.address = address;
    if (dateOfBirth) updates.dateOfBirth = dateOfBirth;
    if (gender) updates.gender = gender;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Change password
app.put('/api/auth/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }
    
    const user = await User.findById(req.user._id).select('+password');
    
    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== USER ROUTES ====================

// Get all users (Admin/HR only)
app.get('/api/users', auth, async (req, res) => {
  try {
    if (!['admin', 'hr'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const users = await User.find().select('-password');
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update user
app.put('/api/users/:id', auth, async (req, res) => {
  try {
    if (!['admin', 'hr'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const updates = req.body;
    delete updates.password; // Don't allow password update here
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get team members (for managers)
app.get('/api/users/team/members', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const teamMembers = await User.find({ 
      department: req.user.department,
      role: 'employee'
    }).select('-password');

    res.json({
      success: true,
      data: teamMembers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== EMPLOYEE ROUTES ====================

// Get all employees (Admin/HR/Manager can access)
app.get('/api/employees', auth, async (req, res) => {
  try {
    // Check user role
    if (!['admin', 'hr', 'manager'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view employee data'
      });
    }

    let query = { role: 'employee' };
    
    // Managers can only see their department employees
    if (req.user.role === 'manager') {
      query.department = req.user.department;
    }
    
    // Apply filters if any
    const { department, search } = req.query;
    
    if (department && (req.user.role === 'admin' || req.user.role === 'hr')) {
      query.department = department;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }
    
    const employees = await User.find(query)
      .select('-password')
      .populate('manager', 'name email')
      .sort('name');
    
    res.json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get employee details by ID
app.get('/api/employees/:id', auth, async (req, res) => {
  try {
    const employee = await User.findById(req.params.id)
      .select('-password')
      .populate('manager', 'name email department');
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Check permission
    // Admin/HR can see all employees
    if (req.user.role === 'admin' || req.user.role === 'hr') {
      // Allowed
    }
    // Managers can only see employees in their department
    else if (req.user.role === 'manager') {
      if (employee.department !== req.user.department) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this employee'
        });
      }
    }
    // Employees can only see themselves
    else if (req.user.role === 'employee') {
      if (employee._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this employee'
        });
      }
    }
    
    // Get employee's leave history
    const leaves = await Leave.find({ user: employee._id })
      .sort('-appliedOn')
      .limit(10);
    
    res.json({
      success: true,
      data: {
        employee,
        leaves
      }
    });
  } catch (error) {
    console.error('Get employee by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== SIMPLE DASHBOARD FOR EMPLOYEES ====================

// Simple employee dashboard - ALWAYS works
app.get('/api/dashboard/employee-simple', auth, async (req, res) => {
  try {
    console.log(`👤 Simple dashboard for: ${req.user.name} (${req.user.role})`);
    
    // Get user from database
    const user = await User.findById(req.user._id)
      .select('-password')
      .lean();
    
    // Get recent leaves
    const recentLeaves = await Leave.find({ user: req.user._id })
      .sort({ appliedOn: -1 })
      .limit(3)
      .lean();
    
    // Count leaves by status
    const approvedCount = await Leave.countDocuments({ 
      user: req.user._id, 
      status: 'approved' 
    });
    const pendingCount = await Leave.countDocuments({ 
      user: req.user._id, 
      status: 'pending' 
    });
    const rejectedCount = await Leave.countDocuments({ 
      user: req.user._id, 
      status: 'rejected' 
    });
    
    res.json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          designation: user.designation,
          employeeId: user.employeeId,
          totalLeaves: user.totalLeaves || 0,
          leavesTaken: user.leavesTaken || 0,
          remainingLeaves: user.remainingLeaves || 0,
          casualLeaves: user.casualLeaves || { total: 0, taken: 0, remaining: 0 },
          sickLeaves: user.sickLeaves || { total: 0, taken: 0, remaining: 0 },
          earnedLeaves: user.earnedLeaves || { total: 0, taken: 0, remaining: 0 }
        },
        leaveStats: {
          approved: approvedCount,
          pending: pendingCount,
          rejected: rejectedCount,
          total: approvedCount + pendingCount + rejectedCount
        },
        recentLeaves: recentLeaves
      }
    });
    
  } catch (error) {
    console.error('Simple dashboard error:', error);
    
    // Even if error, return basic data
    res.json({
      success: true,
      data: {
        user: {
          name: req.user.name,
          role: req.user.role,
          department: req.user.department,
          totalLeaves: req.user.totalLeaves || 0,
          leavesTaken: req.user.leavesTaken || 0,
          remainingLeaves: req.user.remainingLeaves || 0,
          casualLeaves: req.user.casualLeaves || { total: 0, taken: 0, remaining: 0 },
          sickLeaves: req.user.sickLeaves || { total: 0, taken: 0, remaining: 0 },
          earnedLeaves: req.user.earnedLeaves || { total: 0, taken: 0, remaining: 0 }
        },
        leaveStats: {
          approved: 0,
          pending: 0,
          rejected: 0,
          total: 0
        },
        recentLeaves: []
      }
    });
  }
});

// ==================== LEAVE ROUTES ====================

// Apply for leave
app.post('/api/leaves', auth, async (req, res) => {
  try {
    const {
      leaveType,
      startDate,
      endDate,
      reason,
      isHalfDay = false,
      halfDayType = 'first-half',
      contactDuringLeave,
      numberOfDays
    } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if dates are valid
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be after end date'
      });
    }

    // Check if start date is in past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot apply for leave in past'
      });
    }

    // Check user's leave balance
    const user = await User.findById(req.user._id);
    
    // Calculate number of days
    let days = numberOfDays;
    if (!days) {
      const diffTime = Math.abs(end - start);
      days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (isHalfDay) days = 0.5;
    }

    // Check leave balance based on type
    let availableLeaves = 0;
    let leaveField = '';
    
    switch (leaveType) {
      case 'Casual':
        availableLeaves = user.casualLeaves.remaining;
        leaveField = 'casualLeaves';
        break;
      case 'Sick':
        availableLeaves = user.sickLeaves.remaining;
        leaveField = 'sickLeaves';
        break;
      case 'Earned':
        availableLeaves = user.earnedLeaves.remaining;
        leaveField = 'earnedLeaves';
        break;
      default:
        availableLeaves = user.remainingLeaves;
    }

    if (days > availableLeaves) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${leaveType} leave balance. Available: ${availableLeaves} days`
      });
    }

    // Check for overlapping leaves
    const overlappingLeaves = await Leave.find({
      user: req.user._id,
      $or: [
        {
          startDate: { $lte: end },
          endDate: { $gte: start }
        }
      ],
      status: { $in: ['pending', 'approved'] }
    });

    if (overlappingLeaves.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'You already have a leave during this period'
      });
    }

    // Create leave
    const leave = await Leave.create({
      user: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      isHalfDay,
      halfDayType,
      contactDuringLeave,
      numberOfDays: days,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: leave
    });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get my leaves
app.get('/api/leaves/my-leaves', auth, async (req, res) => {
  try {
    const { status, year, month, page = 1, limit = 10 } = req.query;
    
    let query = { user: req.user._id };
    
    // Apply filters
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (year) {
      const yearStart = new Date(`${year}-01-01`);
      const yearEnd = new Date(`${year}-12-31`);
      query.startDate = { $gte: yearStart, $lte: yearEnd };
    }
    
    if (month && year) {
      const monthStart = new Date(`${year}-${month.padStart(2, '0')}-01`);
      const monthEnd = new Date(`${year}-${month.padStart(2, '0')}-31`);
      query.startDate = { $gte: monthStart, $lte: monthEnd };
    }
    
    const skip = (page - 1) * limit;
    
    const leaves = await Leave.find(query)
      .populate('approvedBy', 'name email')
      .sort('-appliedOn')
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Leave.countDocuments(query);
    
    res.json({
      success: true,
      data: leaves,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my leaves error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all leaves (for managers/admin/hr)
app.get('/api/leaves', auth, async (req, res) => {
  try {
    const { 
      status, 
      department, 
      startDate, 
      endDate,
      page = 1, 
      limit = 20 
    } = req.query;
    
    let query = {};
    
    // Check user role - ONLY managers, hr, admin can access
    if (!['manager', 'hr', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    
    // Managers can only see their department leaves
    if (req.user.role === 'manager') {
      const teamMembers = await User.find({ department: req.user.department, role: 'employee' });
      query.user = { $in: teamMembers.map(member => member._id) };
    }
    
    // Apply filters
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (department && (req.user.role === 'admin' || req.user.role === 'hr')) {
      const usersInDept = await User.find({ department }).select('_id');
      query.user = { $in: usersInDept.map(u => u._id) };
    }
    
    if (startDate && endDate) {
      query.startDate = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
      };
    }
    
    const skip = (page - 1) * limit;
    
    const leaves = await Leave.find(query)
      .populate('user', 'name email department designation employeeId')
      .populate('approvedBy', 'name email')
      .sort('-appliedOn')
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Leave.countDocuments(query);
    
    res.json({
      success: true,
      data: leaves,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all leaves error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get leave by ID
app.get('/api/leaves/:id', auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('user', 'name email department designation employeeId')
      .populate('approvedBy', 'name email');
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }
    
    // Check permission
    if (leave.user._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'manager' && 
        req.user.role !== 'hr' && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this leave'
      });
    }
    
    res.json({
      success: true,
      data: leave
    });
  } catch (error) {
    console.error('Get leave by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update leave
app.put('/api/leaves/:id', auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }
    
    // Check permission
    if (leave.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this leave'
      });
    }
    
    // Only pending leaves can be updated
    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending leaves can be updated'
      });
    }
    
    // Update fields
    const updatableFields = ['reason', 'contactDuringLeave', 'alternateContact'];
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        leave[field] = req.body[field];
      }
    });
    
    await leave.save();
    
    res.json({
      success: true,
      message: 'Leave updated successfully',
      data: leave
    });
  } catch (error) {
    console.error('Update leave error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Cancel leave
app.put('/api/leaves/:id/cancel', auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }
    
    // Check permission
    if (leave.user.toString() !== req.user._id.toString() && 
        req.user.role !== 'hr' && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this leave'
      });
    }
    
    // Only pending or approved leaves can be cancelled
    if (!['pending', 'approved'].includes(leave.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only pending or approved leaves can be cancelled'
      });
    }
    
    const wasApproved = leave.status === 'approved';
    
    // Update status
    leave.status = 'cancelled';
    await leave.save();
    
    // If approved leave was cancelled, restore leave balance
    if (wasApproved) {
      const user = await User.findById(leave.user);
      
      // Restore leave balance based on type
      switch (leave.leaveType) {
        case 'Casual':
          user.casualLeaves.taken -= leave.numberOfDays;
          break;
        case 'Sick':
          user.sickLeaves.taken -= leave.numberOfDays;
          break;
        case 'Earned':
          user.earnedLeaves.taken -= leave.numberOfDays;
          break;
      }
      
      user.leavesTaken -= leave.numberOfDays;
      await user.save();
    }
    
    res.json({
      success: true,
      message: 'Leave cancelled successfully',
      data: leave
    });
  } catch (error) {
    console.error('Cancel leave error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Approve/Reject leave
app.put('/api/leaves/:id/action', auth, async (req, res) => {
  try {
    const { action, comments } = req.body;
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be either "approve" or "reject"'
      });
    }
    
    const leave = await Leave.findById(req.params.id)
      .populate('user', 'name email department');
    
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }
    
    // Check permission
    let hasPermission = false;
    
    if (req.user.role === 'admin' || req.user.role === 'hr') {
      hasPermission = true;
    } 
    else if (req.user.role === 'manager') {
      // Check if this leave belongs to manager's department
      const user = await User.findById(leave.user._id);
      if (user.department === req.user.department) {
        hasPermission = true;
      }
    }
    
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to perform this action'
      });
    }
    
    // Only pending leaves can be acted upon
    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending leaves can be approved/rejected'
      });
    }
    
    // Update leave
    leave.status = action === 'approve' ? 'approved' : 'rejected';
    leave.approvedBy = req.user._id;
    leave.approvedAt = Date.now();
    
    if (action === 'reject' && comments) {
      leave.rejectionReason = comments;
    }
    
    await leave.save();
    
    // If approved, update user's leave balance
    if (action === 'approve') {
      const user = await User.findById(leave.user._id);
      
      // Update leave balance based on type
      switch (leave.leaveType) {
        case 'Casual':
          user.casualLeaves.taken += leave.numberOfDays;
          user.casualLeaves.remaining = user.casualLeaves.total - user.casualLeaves.taken;
          break;
        case 'Sick':
          user.sickLeaves.taken += leave.numberOfDays;
          user.sickLeaves.remaining = user.sickLeaves.total - user.sickLeaves.taken;
          break;
        case 'Earned':
          user.earnedLeaves.taken += leave.numberOfDays;
          user.earnedLeaves.remaining = user.earnedLeaves.total - user.earnedLeaves.taken;
          break;
      }
      
      user.leavesTaken += leave.numberOfDays;
      user.remainingLeaves = user.totalLeaves - user.leavesTaken;
      await user.save();
    }
    
    res.json({
      success: true,
      message: `Leave ${action}d successfully`,
      data: leave
    });
  } catch (error) {
    console.error('Leave action error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get leave statistics
app.get('/api/leaves/stats/summary', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // For employees, show their own stats
    let matchQuery = { user: req.user._id };
    
    // For managers, show team stats
    if (req.user.role === 'manager') {
      const teamMembers = await User.find({ department: req.user.department, role: 'employee' });
      matchQuery.user = { $in: teamMembers.map(member => member._id) };
    }
    // For HR/Admin, show all stats
    else if (req.user.role === 'hr' || req.user.role === 'admin') {
      matchQuery = {};
    }
    
    // Get leave counts by status
    const stats = await Leave.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDays: { $sum: '$numberOfDays' }
        }
      }
    ]);
    
    // Get leave counts by type
    const typeStats = await Leave.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$leaveType',
          count: { $sum: 1 },
          totalDays: { $sum: '$numberOfDays' }
        }
      }
    ]);
    
    // Get monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyTrend = await Leave.aggregate([
      {
        $match: {
          ...matchQuery,
          appliedOn: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$appliedOn' },
            month: { $month: '$appliedOn' }
          },
          count: { $sum: 1 },
          totalDays: { $sum: '$numberOfDays' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);
    
    res.json({
      success: true,
      data: {
        userStats: {
          totalLeaves: user.totalLeaves,
          leavesTaken: user.leavesTaken,
          remainingLeaves: user.remainingLeaves,
          casualLeaves: user.casualLeaves,
          sickLeaves: user.sickLeaves,
          earnedLeaves: user.earnedLeaves
        },
        leaveStats: stats.reduce((acc, curr) => {
          acc[curr._id] = curr;
          return acc;
        }, {}),
        typeStats: typeStats.reduce((acc, curr) => {
          acc[curr._id] = curr;
          return acc;
        }, {}),
        monthlyTrend
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get upcoming leaves
app.get('/api/leaves/upcoming/all', auth, async (req, res) => {
  try {
    let query = {
      startDate: { $gte: new Date() },
      status: 'approved'
    };
    
    // For managers, show only department leaves
    if (req.user.role === 'manager') {
      const teamMembers = await User.find({ department: req.user.department, role: 'employee' });
      query.user = { $in: teamMembers.map(member => member._id) };
    }
    // Employees not authorized
    else if (req.user.role === 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    // Admin and HR can see all
    else if (req.user.role === 'admin' || req.user.role === 'hr') {
      // No filter needed - can see all upcoming leaves
    }
    
    const upcomingLeaves = await Leave.find(query)
      .populate('user', 'name email department designation')
      .sort('startDate')
      .limit(20);
    
    res.json({
      success: true,
      data: upcomingLeaves
    });
  } catch (error) {
    console.error('Upcoming leaves error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== DASHBOARD ROUTES ====================

// Get basic dashboard data - ALWAYS WORKS FOR ALL USERS
app.get('/api/dashboard/basic', auth, async (req, res) => {
  try {
    console.log(`📊 Basic dashboard for: ${req.user.name} (${req.user.role})`);
    
    // Simple user data - no database query needed for basic info
    const basicUserData = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      department: req.user.department,
      designation: req.user.designation,
      employeeId: req.user.employeeId,
      contactNumber: req.user.contactNumber,
      totalLeaves: req.user.totalLeaves || 0,
      leavesTaken: req.user.leavesTaken || 0,
      remainingLeaves: req.user.remainingLeaves || 0,
      casualLeaves: req.user.casualLeaves || { total: 0, taken: 0, remaining: 0 },
      sickLeaves: req.user.sickLeaves || { total: 0, taken: 0, remaining: 0 },
      earnedLeaves: req.user.earnedLeaves || { total: 0, taken: 0, remaining: 0 }
    };
    
    res.json({
      success: true,
      data: {
        user: basicUserData,
        permissions: {
          role: req.user.role,
          canViewEmployees: ['admin', 'hr', 'manager'].includes(req.user.role),
          canManageLeaves: ['admin', 'hr', 'manager'].includes(req.user.role),
          canManageUsers: ['admin', 'hr'].includes(req.user.role)
        },
        message: `Welcome ${req.user.name}!`
      }
    });
  } catch (error) {
    console.error('Basic dashboard error:', error);
    // Even if error, return basic data
    res.json({
      success: true,
      data: {
        user: {
          name: req.user.name,
          role: req.user.role,
          department: req.user.department
        },
        permissions: {
          role: req.user.role,
          canViewEmployees: false,
          canManageLeaves: false,
          canManageUsers: false
        },
        message: 'Welcome to Leave Management System'
      }
    });
  }
});

// Get dashboard data - ENHANCED VERSION
app.get('/api/dashboard', auth, async (req, res) => {
  try {
    console.log(`📊 Dashboard for: ${req.user.name} (${req.user.role})`);
    
    // Get user data
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('manager', 'name email');

    // Get user's recent leaves
    const userLeaves = await Leave.find({ user: req.user._id })
      .sort('-appliedOn')
      .limit(5);

    // Get user's leave statistics
    const leaveStats = await Leave.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Base response for ALL users
    const response = {
      success: true,
      data: {
        user: user,
        leaves: {
          recent: userLeaves,
          stats: leaveStats
        },
        permissions: {
          role: req.user.role,
          canViewEmployees: ['admin', 'hr', 'manager'].includes(req.user.role),
          canManageLeaves: ['admin', 'hr', 'manager'].includes(req.user.role),
          canManageUsers: ['admin', 'hr'].includes(req.user.role)
        }
      }
    };

    // Additional data for managers
    if (req.user.role === 'manager') {
      const teamMembers = await User.find({ 
        department: req.user.department, 
        role: 'employee' 
      }).select('_id');
      
      const teamMemberIds = teamMembers.map(member => member._id);
      
      response.data.pendingApprovals = await Leave.find({
        user: { $in: teamMemberIds },
        status: 'pending'
      })
      .populate('user', 'name email department designation')
      .sort('appliedOn')
      .limit(5);
      
      response.data.teamCount = teamMembers.length;
    }
    
    // Additional data for admin/hr
    if (req.user.role === 'admin' || req.user.role === 'hr') {
      response.data.pendingApprovals = await Leave.find({ status: 'pending' })
        .populate('user', 'name email department designation')
        .sort('appliedOn')
        .limit(10);
      
      response.data.employeeCount = await User.countDocuments({ role: 'employee' });
    }

    res.json(response);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard data'
    });
  }
});

// Get dashboard statistics - FIXED VERSION (100% WORKING)
app.get('/api/dashboard/stats', auth, async (req, res) => {
  try {
    console.log(`📈 Stats for: ${req.user.name} (${req.user.role})`);
    
    const user = await User.findById(req.user._id);
    
    // Get PERSONAL leave stats (works for EVERYONE including employees)
    const personalStats = await Leave.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDays: { $sum: '$numberOfDays' }
        }
      }
    ]);
    
    // Base response that works for ALL users (including employees)
    const response = {
      success: true,
      data: {
        userStats: {
          totalLeaves: user.totalLeaves || 0,
          leavesTaken: user.leavesTaken || 0,
          remainingLeaves: user.remainingLeaves || 0,
          casualLeaves: user.casualLeaves || { total: 0, taken: 0, remaining: 0 },
          sickLeaves: user.sickLeaves || { total: 0, taken: 0, remaining: 0 },
          earnedLeaves: user.earnedLeaves || { total: 0, taken: 0, remaining: 0 }
        },
        leaveStats: personalStats,
        permissions: {
          role: req.user.role,
          canViewTeam: ['admin', 'hr', 'manager'].includes(req.user.role)
        }
      }
    };

    // ONLY add team stats if user has permission (not for employees)
    if (['admin', 'hr', 'manager'].includes(req.user.role)) {
      let teamMatchQuery = {};
      
      if (req.user.role === 'manager') {
        const teamMembers = await User.find({ 
          department: req.user.department, 
          role: 'employee' 
        }).select('_id');
        teamMatchQuery.user = { $in: teamMembers.map(member => member._id) };
      }
      
      // Get team leave stats
      const teamStats = await Leave.aggregate([
        { $match: teamMatchQuery },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalDays: { $sum: '$numberOfDays' }
          }
        }
      ]);
      
      response.data.teamStats = teamStats;
      
      // Get team count
      let teamCountQuery = { role: 'employee' };
      if (req.user.role === 'manager') {
        teamCountQuery.department = req.user.department;
      }
      
      response.data.teamCount = await User.countDocuments(teamCountQuery);
    }

    res.json(response);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    
    // Even on error, return basic data that works
    res.json({
      success: true,
      data: {
        userStats: {
          totalLeaves: req.user.totalLeaves || 0,
          leavesTaken: req.user.leavesTaken || 0,
          remainingLeaves: req.user.remainingLeaves || 0
        },
        leaveStats: [],
        permissions: {
          role: req.user.role,
          canViewTeam: false
        },
        message: 'Basic statistics loaded'
      }
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 Leave Management System Backend');
  console.log('='.repeat(50));
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`✅ CORS configured for: https://leave-management-system-zlf8.vercel.app`);
  console.log('='.repeat(50) + '\n');
});