const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['employee', 'manager', 'admin'],
    default: 'employee'
  },
  department: {
    type: String,
    default: 'General'
  },
  leavesAllotted: {
    type: Number,
    default: 12
  },
  leavesTaken: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create test users if they don't exist (static method)
userSchema.statics.createTestUsers = async function() {
  try {
    const testUsers = [
      {
        name: 'Test Manager',
        email: 'manager@test.com',
        password: 'manager123',
        role: 'manager',
        department: 'Management'
      },
      {
        name: 'Test Employee',
        email: 'employee@test.com',
        password: 'employee123',
        role: 'employee',
        department: 'Engineering'
      }
    ];

    for (const userData of testUsers) {
      const userExists = await this.findOne({ email: userData.email });
      if (!userExists) {
        await this.create(userData);
        console.log(`✅ Created test user: ${userData.email}`);
      }
    }
  } catch (error) {
    console.error('❌ Error creating test users:', error.message);
  }
};

module.exports = mongoose.model('User', userSchema);