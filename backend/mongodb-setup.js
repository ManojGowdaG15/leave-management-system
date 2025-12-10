const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Debug: Check if environment variables are loaded
console.log('Environment check:');
console.log('MONGO_URI loaded:', !!process.env.MONGO_URI);
console.log('PORT loaded:', process.env.PORT);

async function setupDatabase() {
    try {
        console.log('\n🔗 Connecting to MongoDB...');
        
        if (!process.env.MONGO_URI) {
            console.error('❌ ERROR: MONGO_URI is not defined in .env file');
            console.log('💡 Make sure your .env file contains:');
            console.log('MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database');
            process.exit(1);
        }
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
        });
        
        console.log('✅ Connected to MongoDB Atlas');
        
        // Import models
        const User = require('./models/User');
        const LeaveApplication = require('./models/LeaveApplication');
        
        console.log('🗑️  Clearing existing data...');
        // Clear existing data
        await User.deleteMany({});
        await LeaveApplication.deleteMany({});
        console.log('✅ Data cleared');
        
        // Hash password for test users
        console.log('🔐 Hashing passwords...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        
        // Create test users
        console.log('👥 Creating test users...');
        const testUsers = [
            {
                name: 'John Doe',
                email: 'employee@test.com',
                password: hashedPassword,
                role: 'employee',
                department: 'Engineering',
                leave_balance: {
                    casual_leaves: 12,
                    sick_leaves: 10,
                    earned_leaves: 15,
                    updated_at: new Date()
                }
            },
            {
                name: 'Jane Smith',
                email: 'manager@test.com',
                password: hashedPassword,
                role: 'manager',
                department: 'Engineering',
                leave_balance: {
                    casual_leaves: 12,
                    sick_leaves: 10,
                    earned_leaves: 15,
                    updated_at: new Date()
                }
            },
            {
                name: 'Admin User',
                email: 'admin@test.com',
                password: hashedPassword,
                role: 'admin',
                department: 'Administration',
                leave_balance: {
                    casual_leaves: 12,
                    sick_leaves: 10,
                    earned_leaves: 15,
                    updated_at: new Date()
                }
            }
        ];
        
        const createdUsers = await User.insertMany(testUsers);
        console.log(`✅ Created ${createdUsers.length} users`);
        
        // Set manager for employee
        const manager = createdUsers.find(u => u.role === 'manager');
        const employee = createdUsers.find(u => u.role === 'employee');
        
        if (manager && employee) {
            employee.manager_id = manager._id;
            await employee.save();
            console.log(`✅ Set ${manager.name} as manager for ${employee.name}`);
        }
        
        // Create sample leave applications
        console.log('📝 Creating sample leave applications...');
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        const sampleLeaves = [
            {
                user_id: employee._id,
                user_name: employee.name,
                start_date: today,
                end_date: today,
                leave_type: 'casual',
                reason: 'Doctor appointment',
                status: 'approved',
                applied_date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                approved_date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                approved_by: manager._id,
                approved_by_name: manager.name,
                leave_days: 1,
                year: today.getFullYear()
            },
            {
                user_id: employee._id,
                user_name: employee.name,
                start_date: nextWeek,
                end_date: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000), // 3 days total
                leave_type: 'casual',
                reason: 'Family vacation',
                status: 'pending',
                applied_date: today,
                leave_days: 3,
                year: today.getFullYear()
            }
        ];
        
        const createdLeaves = await LeaveApplication.insertMany(sampleLeaves);
        console.log(`✅ Created ${createdLeaves.length} leave applications`);
        
        console.log('\n' + '='.repeat(50));
        console.log('🎉 DATABASE SETUP COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(50));
        
        console.log('\n📋 TEST CREDENTIALS:');
        console.log('─'.repeat(30));
        console.log('👤 Employee:');
        console.log('   Email:    employee@test.com');
        console.log('   Password: password123');
        console.log('\n👨‍💼 Manager:');
        console.log('   Email:    manager@test.com');
        console.log('   Password: password123');
        console.log('\n👑 Admin:');
        console.log('   Email:    admin@test.com');
        console.log('   Password: password123');
        
        console.log('\n🔗 API ENDPOINTS:');
        console.log('─'.repeat(30));
        console.log('🌐 Server:     http://localhost:5000');
        console.log('🔐 Login:      POST /api/auth/login');
        console.log('📊 Leave Balance: GET /api/leave/balance');
        console.log('📝 Apply Leave:   POST /api/leave/apply');
        console.log('📋 Leave History: GET /api/leave/history');
        
        console.log('\n⚠️  IMPORTANT:');
        console.log('─'.repeat(30));
        console.log('• Change JWT_SECRET in production');
        console.log('• Update MongoDB password regularly');
        console.log('• Add IP whitelist in MongoDB Atlas');
        
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ SETUP ERROR:', error.message);
        console.log('\n🔧 TROUBLESHOOTING:');
        console.log('─'.repeat(30));
        console.log('1. Check .env file exists in backend folder');
        console.log('2. Verify MONGO_URI format is correct');
        console.log('3. MongoDB Atlas IP whitelist:');
        console.log('   - Go to MongoDB Atlas → Network Access');
        console.log('   - Add IP Address → 0.0.0.0/0 (temporary)');
        console.log('4. Database user permissions:');
        console.log('   - Check if user has read/write access');
        console.log('5. Internet connection');
        console.log('   - Ensure you have stable internet');
        
        console.log('\n📝 .env file should look like:');
        console.log('─'.repeat(30));
        console.log('MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database');
        console.log('JWT_SECRET=your_secret_key');
        console.log('PORT=5000');
        
        process.exit(1);
    }
}

setupDatabase();