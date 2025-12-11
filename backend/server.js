const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Debug logging
console.log('🚀 Starting Leave Management System Backend');
console.log('📁 Environment variables loaded:');
console.log(`   • MONGO_URI: ${process.env.MONGO_URI ? '✅ Loaded' : '❌ Not found'}`);
console.log(`   • JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Loaded' : '❌ Not found'}`);
console.log(`   • PORT: ${process.env.PORT || '❌ Using default (5000)'}`);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ MongoDB Connected Successfully');
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);
})
.catch(err => {
    console.log('❌ MongoDB Connection Error:');
    console.log(`   • Error: ${err.message}`);
    console.log('   • Make sure:');
    console.log('     1. .env file exists with MONGO_URI');
    console.log('     2. MongoDB Atlas IP is whitelisted');
    console.log('     3. Internet connection is stable');
    process.exit(1);
});

// Middleware
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth');
const leaveRoutes = require('./routes/leave');
const dashboardRoutes = require('./routes/dashboard'); // Add this line

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/dashboard', dashboardRoutes); // Add this line

// Root route
app.get('/', (req, res) => {
    res.json({
        message: '🚀 Leave Management System API',
        version: '1.0.0',
        endpoints: {
            auth: {
                login: 'POST /api/auth/login',
                getProfile: 'GET /api/auth/me'
            },
            leave: {
                balance: 'GET /api/leave/balance',
                apply: 'POST /api/leave/apply',
                history: 'GET /api/leave/history',
                cancel: 'PUT /api/leave/cancel/:id',
                pending: 'GET /api/leave/pending',
                approve: 'PUT /api/leave/approve/:id',
                teamCalendar: 'GET /api/leave/team-calendar'
            },
            dashboard: { // Add this section
                dashboard: 'GET /api/dashboard'
            }
        },
        status: 'operational',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    const health = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        memory: process.memoryUsage(),
        version: process.version
    };
    res.json(health);
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `The route ${req.method} ${req.url} does not exist`
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('🔥 Server Error:', err.stack);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🔗 Local: http://localhost:${PORT}`);
    console.log('📚 API Documentation available at root (/)');
    console.log('🏥 Health check: /health');
    console.log('='.repeat(50));
    console.log('\n🚀 Ready to accept requests...');
});