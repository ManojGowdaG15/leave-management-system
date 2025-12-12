const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Leave Management System API is running!',
    version: '1.0.0',
    status: 'active',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      leaves: '/api/leaves',
      dashboard: '/api/dashboard',
      health: '/health'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: mongoose.connection.readyState === 1 ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

// Test auth route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // Test with seeded credentials
    if (email === 'admin@company.com' && password === 'Admin@123') {
      return res.json({
        success: true,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDQwMDQwMDB9.test-token-for-development',
        user: {
          id: '1',
          name: 'Super Admin',
          email: 'admin@company.com',
          role: 'admin',
          department: 'Administration',
          designation: 'System Administrator',
          employeeId: 'ADM001',
          remainingLeaves: 28
        }
      });
    }
    
    // Test with HR manager
    if (email === 'hr@company.com' && password === 'Hr@123') {
      return res.json({
        success: true,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIiLCJyb2xlIjoiaHIiLCJpYXQiOjE3MDQwMDQwMDB9.test-token-for-development',
        user: {
          id: '2',
          name: 'HR Manager',
          email: 'hr@company.com',
          role: 'hr',
          department: 'HR',
          designation: 'HR Manager',
          employeeId: 'HR001',
          remainingLeaves: 23
        }
      });
    }
    
    // Test with employee
    if (email === 'eng.employee1@company.com' && password === 'Employee@123') {
      return res.json({
        success: true,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMiLCJyb2xlIjoiZW1wbG95ZWUiLCJpYXQiOjE3MDQwMDQwMDB9.test-token-for-development',
        user: {
          id: '3',
          name: 'Engineering Employee 1',
          email: 'eng.employee1@company.com',
          role: 'employee',
          department: 'Engineering',
          designation: 'Senior Software Engineer',
          employeeId: 'ENG002',
          remainingLeaves: 20
        }
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials. Try: admin@company.com / Admin@123'
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Test protected route
app.get('/api/test/protected', (req, res) => {
  const token = req.headers.authorization;
  
  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Please provide a valid token'
    });
  }
  
  res.json({
    success: true,
    message: 'This is a protected route',
    user: {
      id: 'test-id',
      role: 'admin'
    }
  });
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
  console.log('\n🔐 Test Login Credentials:');
  console.log('- Admin: admin@company.com / Admin@123');
  console.log('- HR Manager: hr@company.com / Hr@123');
  console.log('- Employee: eng.employee1@company.com / Employee@123');
  console.log('='.repeat(50) + '\n');
});