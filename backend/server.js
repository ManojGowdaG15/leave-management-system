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
  'https://leave-management-system-zlf8-*.vercel.app', // Allow all preview deployments
  'https://leave-management-system-1-kv66.onrender.com',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5173',
  'https://leave-management-system-zlf8-9yl4ojrec-manoj-gowda-gs-projects.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if origin matches exactly
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Check for wildcard matches (for Vercel preview deployments)
    if (origin && origin.endsWith('.vercel.app')) {
      // Allow all vercel.app subdomains for preview deployments
      return callback(null, true);
    }
    
    console.log('❌ Blocked by CORS:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} | Origin: ${req.headers.origin || 'none'}`);
  next();
});

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leave_management';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Models
const User = require('./models/User');
const Leave = require('./models/Leave');

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    let token;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      token = authHeader; // In case token is sent without Bearer prefix
    }
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please authenticate. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
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
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }
    
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
      note: 'Vercel preview deployments are allowed'
    },
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        me: 'GET /api/auth/me'
      },
      health: 'GET /health'
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
    memory: process.memoryUsage(),
    cors: {
      allowedOrigins: allowedOrigins
    }
  });
});

// ==================== AUTH ROUTES ====================

// Test endpoint to verify server is working
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Server is working!',
    timestamp: new Date().toISOString()
  });
});

// Login endpoint with better error handling
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt from:', req.headers.origin);
    console.log('📧 Request body:', JSON.stringify(req.body));
    
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // Trim and lowercase email
    const cleanEmail = email.trim().toLowerCase();
    
    // Find user
    const user = await User.findOne({ email: cleanEmail }).select('+password');
    
    if (!user) {
      console.log('❌ User not found with email:', cleanEmail);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', cleanEmail);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        role: user.role 
      }, 
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    console.log('✅ Login successful for:', user.email);
    
    // Return user data (excluding password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      designation: user.designation,
      employeeId: user.employeeId,
      contactNumber: user.contactNumber,
      totalLeaves: user.totalLeaves || 0,
      leavesTaken: user.leavesTaken || 0,
      remainingLeaves: user.remainingLeaves || 0,
      casualLeaves: user.casualLeaves || { total: 0, taken: 0, remaining: 0 },
      sickLeaves: user.sickLeaves || { total: 0, taken: 0, remaining: 0 },
      earnedLeaves: user.earnedLeaves || { total: 0, taken: 0, remaining: 0 },
      isActive: user.isActive,
      lastLogin: user.lastLogin
    };
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Register endpoint (for testing)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, department, designation, employeeId } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'employee',
      department: department || 'Engineering',
      designation: designation || 'Software Engineer',
      employeeId: employeeId || `EMP${Date.now()}`,
      totalLeaves: 30,
      leavesTaken: 0,
      remainingLeaves: 30,
      casualLeaves: { total: 10, taken: 0, remaining: 10 },
      sickLeaves: { total: 10, taken: 0, remaining: 10 },
      earnedLeaves: { total: 10, taken: 0, remaining: 10 },
      isActive: true
    });
    
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        employeeId: user.employeeId
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
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

// Simple endpoint to check auth without database query
app.get('/api/auth/check', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// ==================== TEMPORARY TEST ENDPOINTS ====================

// Create a test user if none exists
app.get('/api/setup-test-user', async (req, res) => {
  try {
    // Check if test user exists
    const testEmail = 'test@example.com';
    let user = await User.findOne({ email: testEmail });
    
    if (!user) {
      // Create test user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      user = new User({
        name: 'Test User',
        email: testEmail,
        password: hashedPassword,
        role: 'employee',
        department: 'Engineering',
        designation: 'Software Engineer',
        employeeId: 'TEST001',
        totalLeaves: 30,
        leavesTaken: 5,
        remainingLeaves: 25,
        casualLeaves: { total: 10, taken: 2, remaining: 8 },
        sickLeaves: { total: 10, taken: 2, remaining: 8 },
        earnedLeaves: { total: 10, taken: 1, remaining: 9 },
        isActive: true
      });
      
      await user.save();
      
      res.json({
        success: true,
        message: 'Test user created',
        credentials: {
          email: 'test@example.com',
          password: 'password123'
        },
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.json({
        success: true,
        message: 'Test user already exists',
        credentials: {
          email: 'test@example.com',
          password: 'password123'
        }
      });
    }
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({
      success: false,
      message: 'Setup failed',
      error: error.message
    });
  }
});

// List all users (for debugging)
app.get('/api/users/all', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== LEAVE ROUTES ====================

// Get my leaves
app.get('/api/leaves/my-leaves', auth, async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user._id })
      .sort('-createdAt')
      .limit(10);
    
    res.json({
      success: true,
      count: leaves.length,
      leaves
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Apply for leave
app.post('/api/leaves', auth, async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    const leave = new Leave({
      user: req.user._id,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'pending'
    });
    
    await leave.save();
    
    res.status(201).json({
      success: true,
      message: 'Leave application submitted',
      leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== FALLBACK ROUTES ====================

// Handle /auth/login (without /api prefix) for compatibility
app.post('/auth/login', async (req, res) => {
  console.log('⚠️ Using deprecated endpoint /auth/login. Use /api/auth/login instead.');
  // Forward to the correct endpoint
  const originalUrl = req.originalUrl;
  req.url = '/api/auth/login';
  return app._router.handle(req, res);
});

// Handle /auth/register (without /api prefix)
app.post('/auth/register', async (req, res) => {
  console.log('⚠️ Using deprecated endpoint /auth/register. Use /api/auth/register instead.');
  req.url = '/api/auth/register';
  return app._router.handle(req, res);
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    suggestion: 'Use /api prefix for all API endpoints'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.message);
  
  // Handle CORS errors
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'CORS error: Not allowed by CORS policy',
      origin: req.headers.origin,
      allowedOrigins: allowedOrigins
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 Leave Management System Backend');
  console.log('='.repeat(50));
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🔑 JWT Secret: ${JWT_SECRET ? 'Set ✓' : 'Not set! Using default'}`);
  console.log('='.repeat(50));
  console.log('\nAvailable endpoints:');
  console.log('1. POST /api/auth/login - User login');
  console.log('2. POST /api/auth/register - Register new user');
  console.log('3. GET /api/auth/me - Get current user (requires auth)');
  console.log('4. GET /api/health - Health check');
  console.log('5. GET /api/setup-test-user - Create test user');
  console.log('='.repeat(50) + '\n');
});