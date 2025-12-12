const mongoose = require('mongoose');
const User = require('../models/User');
const Leave = require('../models/Leave');
const LeavePolicy = require('../models/LeavePolicy');
require('dotenv').config();

const generateEmployeeId = (dept, number) => {
  const deptCodes = {
    'Engineering': 'ENG',
    'HR': 'HR',
    'Marketing': 'MKT',
    'Sales': 'SAL',
    'Finance': 'FIN',
    'Operations': 'OPS',
    'IT': 'IT',
    'Administration': 'ADM'
  };
  return `${deptCodes[dept]}${number.toString().padStart(3, '0')}`;
};

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Clear existing data
    await User.deleteMany({});
    await Leave.deleteMany({});
    await LeavePolicy.deleteMany({});
    
    console.log('🗑️  Cleared existing data');
    
    // ========== CREATE LEAVE POLICIES ==========
    const policies = [
      {
        policyName: 'Casual Leave Policy 2024',
        leaveType: 'Casual',
        description: 'For personal or casual work',
        eligibleRoles: ['admin', 'hr', 'manager', 'employee'],
        eligibleDepartments: ['Engineering', 'HR', 'Marketing', 'Sales', 'Finance', 'Operations', 'IT', 'Administration'],
        maxDaysPerYear: 12,
        maxConsecutiveDays: 5,
        advanceNoticeDays: 2,
        requiresDocumentation: false,
        allowCarryForward: true,
        maxCarryForwardDays: 3,
        isActive: true
      },
      {
        policyName: 'Sick Leave Policy 2024',
        leaveType: 'Sick',
        description: 'For medical reasons',
        eligibleRoles: ['admin', 'hr', 'manager', 'employee'],
        eligibleDepartments: ['Engineering', 'HR', 'Marketing', 'Sales', 'Finance', 'Operations', 'IT', 'Administration'],
        maxDaysPerYear: 10,
        maxConsecutiveDays: 7,
        advanceNoticeDays: 0,
        requiresDocumentation: true,
        documentationTypes: ['Medical Certificate'],
        allowCarryForward: false,
        isActive: true
      },
      {
        policyName: 'Earned Leave Policy 2024',
        leaveType: 'Earned',
        description: 'Privilege leave or annual leave',
        eligibleRoles: ['admin', 'hr', 'manager', 'employee'],
        eligibleDepartments: ['Engineering', 'HR', 'Marketing', 'Sales', 'Finance', 'Operations', 'IT', 'Administration'],
        maxDaysPerYear: 15,
        maxConsecutiveDays: 15,
        advanceNoticeDays: 7,
        requiresDocumentation: false,
        allowCarryForward: true,
        maxCarryForwardDays: 30,
        isActive: true
      },
      {
        policyName: 'Maternity Leave Policy',
        leaveType: 'Maternity',
        description: 'For pregnant employees',
        eligibleRoles: ['employee'],
        eligibleDepartments: ['Engineering', 'HR', 'Marketing', 'Sales', 'Finance', 'Operations', 'IT', 'Administration'],
        maxDaysPerYear: 180,
        minServiceDays: 365,
        advanceNoticeDays: 30,
        requiresDocumentation: true,
        documentationTypes: ['Medical Certificate', 'Pregnancy Proof'],
        isActive: true
      }
    ];
    
    await LeavePolicy.insertMany(policies);
    console.log('✅ Created leave policies');
    
    // ========== CREATE USERS ==========
    
    // 1. Create Admin
    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@company.com',
      password: 'Admin@123',
      role: 'admin',
      department: 'Administration',
      designation: 'System Administrator',
      employeeId: 'ADM001',
      joiningDate: new Date('2020-01-01'),
      contactNumber: '+91 9876543210',
      totalLeaves: 30,
      casualLeaves: { total: 12, taken: 2, remaining: 10 },
      sickLeaves: { total: 10, taken: 1, remaining: 9 },
      earnedLeaves: { total: 15, taken: 3, remaining: 12 }
    });
    
    // 2. Create HR Manager
    const hrManager = await User.create({
      name: 'HR Manager',
      email: 'hr@company.com',
      password: 'Hr@123',
      role: 'hr',
      department: 'HR',
      designation: 'HR Manager',
      employeeId: 'HR001',
      joiningDate: new Date('2021-03-15'),
      contactNumber: '+91 9876543211',
      manager: admin._id,
      totalLeaves: 28,
      casualLeaves: { total: 12, taken: 4, remaining: 8 },
      sickLeaves: { total: 10, taken: 2, remaining: 8 },
      earnedLeaves: { total: 15, taken: 5, remaining: 10 }
    });
    
    // 3. Create Department Managers
    const engineeringManager = await User.create({
      name: 'Engineering Manager',
      email: 'eng.manager@company.com',
      password: 'Manager@123',
      role: 'manager',
      department: 'Engineering',
      designation: 'Engineering Manager',
      employeeId: 'ENG001',
      joiningDate: new Date('2021-06-01'),
      contactNumber: '+91 9876543212',
      manager: admin._id,
      totalLeaves: 28,
      casualLeaves: { total: 12, taken: 3, remaining: 9 },
      sickLeaves: { total: 10, taken: 2, remaining: 8 },
      earnedLeaves: { total: 15, taken: 4, remaining: 11 }
    });
    
    const salesManager = await User.create({
      name: 'Sales Manager',
      email: 'sales.manager@company.com',
      password: 'Manager@123',
      role: 'manager',
      department: 'Sales',
      designation: 'Sales Manager',
      employeeId: 'SAL001',
      joiningDate: new Date('2021-07-01'),
      contactNumber: '+91 9876543213',
      manager: admin._id,
      totalLeaves: 28,
      casualLeaves: { total: 12, taken: 6, remaining: 6 },
      sickLeaves: { total: 10, taken: 1, remaining: 9 },
      earnedLeaves: { total: 15, taken: 2, remaining: 13 }
    });
    
    // 4. Create Employees for Engineering Department
    const engineeringEmployees = [];
    const engineeringDesignations = [
      'Senior Software Engineer',
      'Software Engineer',
      'Frontend Developer',
      'Backend Developer',
      'Full Stack Developer',
      'QA Engineer',
      'DevOps Engineer'
    ];
    
    for (let i = 1; i <= 7; i++) {
      const employee = await User.create({
        name: `Engineering Employee ${i}`,
        email: `eng.employee${i}@company.com`,
        password: 'Employee@123',
        role: 'employee',
        department: 'Engineering',
        designation: engineeringDesignations[i - 1],
        employeeId: generateEmployeeId('Engineering', i + 1),
        joiningDate: new Date(`2022-0${i}-01`),
        contactNumber: `+91 98765${43210 + i}`,
        manager: engineeringManager._id,
        totalLeaves: 24,
        casualLeaves: { total: 12, taken: Math.floor(Math.random() * 5), remaining: 12 },
        sickLeaves: { total: 10, taken: Math.floor(Math.random() * 3), remaining: 10 },
        earnedLeaves: { total: 15, taken: Math.floor(Math.random() * 8), remaining: 15 }
      });
      engineeringEmployees.push(employee);
    }
    
    // 5. Create Employees for Sales Department
    const salesEmployees = [];
    const salesDesignations = [
      'Sales Executive',
      'Senior Sales Executive',
      'Sales Representative',
      'Account Manager',
      'Business Development Executive'
    ];
    
    for (let i = 1; i <= 5; i++) {
      const employee = await User.create({
        name: `Sales Employee ${i}`,
        email: `sales.employee${i}@company.com`,
        password: 'Employee@123',
        role: 'employee',
        department: 'Sales',
        designation: salesDesignations[i - 1],
        employeeId: generateEmployeeId('Sales', i + 1),
        joiningDate: new Date(`2022-0${i + 3}-01`),
        contactNumber: `+91 98765${43220 + i}`,
        manager: salesManager._id,
        totalLeaves: 24,
        casualLeaves: { total: 12, taken: Math.floor(Math.random() * 6), remaining: 12 },
        sickLeaves: { total: 10, taken: Math.floor(Math.random() * 4), remaining: 10 },
        earnedLeaves: { total: 15, taken: Math.floor(Math.random() * 10), remaining: 15 }
      });
      salesEmployees.push(employee);
    }
    
    // 6. Create HR Employees
    const hrEmployees = [];
    const hrDesignations = [
      'HR Executive',
      'Recruiter',
      'Payroll Specialist',
      'Training Coordinator'
    ];
    
    for (let i = 1; i <= 4; i++) {
      const employee = await User.create({
        name: `HR Employee ${i}`,
        email: `hr.employee${i}@company.com`,
        password: 'Employee@123',
        role: 'employee',
        department: 'HR',
        designation: hrDesignations[i - 1],
        employeeId: generateEmployeeId('HR', i + 1),
        joiningDate: new Date(`2022-0${i + 2}-01`),
        contactNumber: `+91 98765${43230 + i}`,
        manager: hrManager._id,
        totalLeaves: 24,
        casualLeaves: { total: 12, taken: Math.floor(Math.random() * 4), remaining: 12 },
        sickLeaves: { total: 10, taken: Math.floor(Math.random() * 2), remaining: 10 },
        earnedLeaves: { total: 15, taken: Math.floor(Math.random() * 7), remaining: 15 }
      });
      hrEmployees.push(employee);
    }
    
    // Update managers with their team members
    await User.findByIdAndUpdate(engineeringManager._id, {
      teamMembers: engineeringEmployees.map(e => e._id)
    });
    
    await User.findByIdAndUpdate(salesManager._id, {
      teamMembers: salesEmployees.map(e => e._id)
    });
    
    await User.findByIdAndUpdate(hrManager._id, {
      teamMembers: hrEmployees.map(e => e._id)
    });
    
    console.log('✅ Created users with hierarchy');
    
    // ========== CREATE SAMPLE LEAVE APPLICATIONS ==========
    const leaveApplications = [];
    
    // Create some approved leaves
    leaveApplications.push(
      await Leave.create({
        user: engineeringEmployees[0]._id,
        leaveType: 'Casual',
        startDate: new Date('2024-01-10'),
        endDate: new Date('2024-01-12'),
        numberOfDays: 3,
        reason: 'Family wedding',
        status: 'approved',
        approvedBy: engineeringManager._id,
        approvedAt: new Date('2024-01-05'),
        contactDuringLeave: '+91 9876540001'
      })
    );
    
    leaveApplications.push(
      await Leave.create({
        user: engineeringEmployees[1]._id,
        leaveType: 'Sick',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-16'),
        numberOfDays: 2,
        reason: 'High fever and cold',
        status: 'approved',
        approvedBy: engineeringManager._id,
        approvedAt: new Date('2024-01-14'),
        contactDuringLeave: '+91 9876540002',
        supportingDocuments: [{
          fileName: 'medical_certificate.pdf',
          filePath: '/uploads/medical_certificate.pdf'
        }]
      })
    );
    
    leaveApplications.push(
      await Leave.create({
        user: salesEmployees[0]._id,
        leaveType: 'Earned',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-10'),
        numberOfDays: 10,
        reason: 'Annual vacation with family',
        status: 'approved',
        approvedBy: salesManager._id,
        approvedAt: new Date('2024-01-20'),
        contactDuringLeave: '+91 9876540003',
        alternateContact: '+91 9876540004'
      })
    );
    
    // Create some pending leaves
    leaveApplications.push(
      await Leave.create({
        user: engineeringEmployees[2]._id,
        leaveType: 'Casual',
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-02-15'),
        numberOfDays: 1,
        isHalfDay: true,
        halfDayType: 'first-half',
        reason: 'Doctor appointment',
        status: 'pending',
        contactDuringLeave: '+91 9876540005'
      })
    );
    
    leaveApplications.push(
      await Leave.create({
        user: salesEmployees[1]._id,
        leaveType: 'Casual',
        startDate: new Date('2024-02-20'),
        endDate: new Date('2024-02-21'),
        numberOfDays: 2,
        reason: 'Personal work',
        status: 'pending',
        contactDuringLeave: '+91 9876540006'
      })
    );
    
    // Create some rejected leaves
    leaveApplications.push(
      await Leave.create({
        user: hrEmployees[0]._id,
        leaveType: 'Casual',
        startDate: new Date('2024-01-25'),
        endDate: new Date('2024-01-30'),
        numberOfDays: 6,
        reason: 'Family function',
        status: 'rejected',
        approvedBy: hrManager._id,
        approvedAt: new Date('2024-01-20'),
        rejectionReason: 'Cannot approve 6 consecutive days during project deadline'
      })
    );
    
    console.log('✅ Created sample leave applications');
    
    // Update user leave balances based on approved leaves
    for (const leave of leaveApplications) {
      if (leave.status === 'approved') {
        const user = await User.findById(leave.user);
        user.leavesTaken += leave.numberOfDays;
        
        // Update specific leave type balance
        if (leave.leaveType === 'Casual') {
          user.casualLeaves.taken += leave.numberOfDays;
        } else if (leave.leaveType === 'Sick') {
          user.sickLeaves.taken += leave.numberOfDays;
        } else if (leave.leaveType === 'Earned') {
          user.earnedLeaves.taken += leave.numberOfDays;
        }
        
        await user.save();
      }
    }
    
    console.log('✅ Updated user leave balances');
    
    // ========== DISPLAY SUMMARY ==========
    console.log('\n🎉 Database Seeding Completed Successfully!');
    console.log('=' .repeat(50));
    console.log('\n📊 SUMMARY:');
    console.log(`- Total Users: ${await User.countDocuments()}`);
    console.log(`- Total Leave Policies: ${await LeavePolicy.countDocuments()}`);
    console.log(`- Total Leave Applications: ${await Leave.countDocuments()}`);
    
    console.log('\n🔐 LOGIN CREDENTIALS:');
    console.log('=' .repeat(30));
    console.log('Super Admin:');
    console.log('  Email: admin@company.com');
    console.log('  Password: Admin@123');
    console.log('\nHR Manager:');
    console.log('  Email: hr@company.com');
    console.log('  Password: Hr@123');
    console.log('\nEngineering Manager:');
    console.log('  Email: eng.manager@company.com');
    console.log('  Password: Manager@123');
    console.log('\nSales Manager:');
    console.log('  Email: sales.manager@company.com');
    console.log('  Password: Manager@123');
    console.log('\nEngineering Employee 1:');
    console.log('  Email: eng.employee1@company.com');
    console.log('  Password: Employee@123');
    console.log('\nSales Employee 1:');
    console.log('  Email: sales.employee1@company.com');
    console.log('  Password: Employee@123');
    console.log('\nHR Employee 1:');
    console.log('  Email: hr.employee1@company.com');
    console.log('  Password: Employee@123');
    
    console.log('\n📝 NOTE:');
    console.log('- All employees can login with Employee@123');
    console.log('- Managers can approve/reject leaves of their team members');
    console.log('- HR can manage all leaves and users');
    console.log('- Admin has full system access');
    
    console.log('\n✅ Seeding completed!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
seedData();