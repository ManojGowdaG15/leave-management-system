const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/leave-management';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        console.log('\n⚠️  If MongoDB is not running, start it with:');
        console.log('   Windows: net start MongoDB');
        console.log('   Mac/Linux: brew services start mongodb-community');
        console.log('   Or run: mongod');
    });

// Import models (they will be created automatically when we use them)
require('./models/User');
require('./models/Leave');
require('./models/Department');

// Import routes
const authRoutes = require('./routes/auth');
const leavesRoutes = require('./routes/leaves');
const usersRoutes = require('./routes/users');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/leaves', leavesRoutes);
app.use('/api/users', usersRoutes);

// Default route
app.get('/', (req, res) => {
    res.json({
        message: 'Leave Management System API',
        version: '1.0.0',
        endpoints: {
            auth: {
                login: 'POST /api/auth/login',
                register: 'POST /api/auth/register',
                me: 'GET /api/auth/me'
            },
            leaves: {
                apply: 'POST /api/leaves',
                myLeaves: 'GET /api/leaves/my-leaves',
                allLeaves: 'GET /api/leaves',
                updateStatus: 'PATCH /api/leaves/:id/status',
                cancel: 'PATCH /api/leaves/:id/cancel'
            },
            users: {
                profile: 'GET /api/users/profile',
                teamMembers: 'GET /api/users/team/members'
            }
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}`);
    console.log(`📝 API Documentation: http://localhost:${PORT}/`);
});