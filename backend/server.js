const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
}));

// Mount routers
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/employee', require('./routes/employeeRoutes'));
app.use('/api/manager', require('./routes/managerRoutes'));

// Welcome route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🚀 Leave Management System API is running',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            leaves: '/api/leaves',
            employee: '/api/employee',
            manager: '/api/manager',
        },
        sample_users: {
            manager: { email: 'manager@test.com', password: 'manager123' },
            employee: { email: 'employee@test.com', password: 'employee123' },
        },
    });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}`);
    console.log(`👤 Test Manager: manager@test.com / manager123`);
    console.log(`👤 Test Employee: employee@test.com / employee123`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`❌ Error: ${err.message}`);
    // Close server & exit process
    // server.close(() => process.exit(1));
});