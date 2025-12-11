const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// In-memory storage
const users = [
    { id: 1, email: 'manager@test.com', password: 'manager123', name: 'Manager', role: 'manager' },
    { id: 2, email: 'employee@test.com', password: 'employee123', name: 'Employee', role: 'employee' }
];

let leaves = [];
let tokenCounter = 1;

// Login
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        const token = `token_${user.id}_${tokenCounter++}`;
        res.json({
            success: true,
            token: token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
        });
    } else {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
});

// Apply leave
app.post('/api/leaves', (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false, 
            error: 'No token. Please login first.' 
        });
    }
    
    const token = authHeader.split(' ')[1];
    const userId = token.split('_')[1]; // Extract user ID from token
    
    const user = users.find(u => u.id == userId);
    
    if (!user) {
        return res.status(401).json({ 
            success: false, 
            error: 'Invalid token' 
        });
    }
    
    const leave = {
        id: leaves.length + 1,
        employeeId: user.id,
        employeeName: user.name,
        ...req.body,
        status: 'pending',
        appliedDate: new Date().toISOString()
    };
    
    leaves.push(leave);
    
    res.json({ 
        success: true, 
        message: 'Leave applied successfully!', 
        data: leave 
    });
});

// Get leaves
app.get('/api/leaves', (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            success: false, 
            error: 'No token' 
        });
    }
    
    const token = authHeader.split(' ')[1];
    const userId = token.split('_')[1];
    
    const userLeaves = leaves.filter(l => l.employeeId == userId);
    
    res.json({ 
        success: true, 
        count: userLeaves.length, 
        data: userLeaves 
    });
});

// Home
app.get('/', (req, res) => {
    res.json({ 
        message: 'Leave Management API (Memory DB)',
        status: 'working',
        endpoints: [
            'POST /api/auth/login',
            'POST /api/leaves',
            'GET /api/leaves'
        ]
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`
    🎉 BACKEND RUNNING!
    ===================
    ✅ Server: http://localhost:${PORT}
    ✅ No MongoDB needed
    ✅ Test login works
    
    🔑 Test Credentials:
       • manager@test.com / manager123
       • employee@test.com / employee123
    `);
});