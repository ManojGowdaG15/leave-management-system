const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leave_management', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    department: { type: String, default: 'Engineering' },
    role: { type: String, default: 'employee' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Leave Schema
const leaveSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['casual', 'sick', 'earned'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    appliedDate: { type: Date, default: Date.now }
}, { timestamps: true });

const Leave = mongoose.model('Leave', leaveSchema);

// Leave Balance Schema
const leaveBalanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    casualLeaves: { type: Number, default: 12 },
    sickLeaves: { type: Number, default: 10 },
    earnedLeaves: { type: Number, default: 15 },
    usedCasual: { type: Number, default: 0 },
    usedSick: { type: Number, default: 0 },
    usedEarned: { type: Number, default: 0 }
});

const LeaveBalance = mongoose.model('LeaveBalance', leaveBalanceSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Routes

// Register User
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword
        });
        
        await user.save();
        
        // Create leave balance for user
        const leaveBalance = new LeaveBalance({
            userId: user._id
        });
        await leaveBalance.save();
        
        // Generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                department: user.department
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login User
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        // Generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                department: user.department
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get Dashboard Data
app.get('/api/dashboard', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Get user's leave balance
        const leaveBalance = await LeaveBalance.findOne({ userId });
        
        // Get leave counts
        const pendingLeaves = await Leave.countDocuments({ 
            userId, 
            status: 'pending' 
        });
        
        const approvedLeaves = await Leave.countDocuments({ 
            userId, 
            status: 'approved' 
        });
        
        const rejectedLeaves = await Leave.countDocuments({ 
            userId, 
            status: 'rejected' 
        });
        
        // Get recent leaves
        const recentLeaves = await Leave.find({ userId })
            .sort({ appliedDate: -1 })
            .limit(5)
            .select('type startDate endDate reason status appliedDate');
        
        // Format the response
        const dashboardData = {
            user: {
                name: req.user.name,
                email: req.user.email
            },
            leaveBalance: leaveBalance || {
                casualLeaves: 12,
                sickLeaves: 10,
                earnedLeaves: 15,
                usedCasual: 0,
                usedSick: 0,
                usedEarned: 0
            },
            leaveCounts: {
                pending: pendingLeaves,
                approved: approvedLeaves,
                rejected: rejectedLeaves
            },
            recentLeaves: recentLeaves.map(leave => ({
                id: leave._id,
                type: leave.type,
                startDate: leave.startDate,
                endDate: leave.endDate,
                reason: leave.reason,
                status: leave.status,
                appliedDate: leave.appliedDate
            }))
        };
        
        res.json(dashboardData);
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to load dashboard data' });
    }
});

// Get Leave Balance
app.get('/api/leave-balance', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const leaveBalance = await LeaveBalance.findOne({ userId });
        
        if (!leaveBalance) {
            // Create default balance if not exists
            const newBalance = new LeaveBalance({ userId });
            await newBalance.save();
            return res.json(newBalance);
        }
        
        res.json(leaveBalance);
    } catch (error) {
        console.error('Leave balance error:', error);
        res.status(500).json({ error: 'Failed to fetch leave balance' });
    }
});

// Apply for Leave
app.post('/api/leaves', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { type, startDate, endDate, reason } = req.body;
        
        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (start > end) {
            return res.status(400).json({ error: 'End date must be after start date' });
        }
        
        // Check leave balance
        const leaveBalance = await LeaveBalance.findOne({ userId });
        if (!leaveBalance) {
            return res.status(400).json({ error: 'Leave balance not found' });
        }
        
        // Calculate days
        const timeDiff = end.getTime() - start.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
        
        // Check available balance
        if (type === 'casual' && leaveBalance.casualLeaves - leaveBalance.usedCasual < daysDiff) {
            return res.status(400).json({ error: 'Insufficient casual leave balance' });
        }
        if (type === 'sick' && leaveBalance.sickLeaves - leaveBalance.usedSick < daysDiff) {
            return res.status(400).json({ error: 'Insufficient sick leave balance' });
        }
        if (type === 'earned' && leaveBalance.earnedLeaves - leaveBalance.usedEarned < daysDiff) {
            return res.status(400).json({ error: 'Insufficient earned leave balance' });
        }
        
        // Create leave
        const leave = new Leave({
            userId,
            type,
            startDate: start,
            endDate: end,
            reason,
            status: 'pending'
        });
        
        await leave.save();
        
        res.status(201).json({
            message: 'Leave application submitted successfully',
            leave
        });
    } catch (error) {
        console.error('Leave application error:', error);
        res.status(500).json({ error: 'Failed to submit leave application' });
    }
});

// Get All Leaves for User
app.get('/api/leaves', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const leaves = await Leave.find({ userId })
            .sort({ appliedDate: -1 });
        
        res.json(leaves);
    } catch (error) {
        console.error('Get leaves error:', error);
        res.status(500).json({ error: 'Failed to fetch leaves' });
    }
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Default route
app.get('/', (req, res) => {
    res.send('Leave Management System API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Test API: http://localhost:${PORT}/api/test`);
});