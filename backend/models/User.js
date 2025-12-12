const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'hr', 'manager', 'employee'],
    default: 'employee'
  },
  department: {
    type: String,
    required: true,
    enum: ['Engineering', 'HR', 'Marketing', 'Sales', 'Finance', 'Operations', 'IT', 'Administration']
  },
  designation: {
    type: String,
    required: true
  },
  employeeId: {
    type: String,
    unique: true,
    required: true
  },
  joiningDate: {
    type: Date,
    required: true
  },
  contactNumber: String,
  address: String,
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  // Leave Balance
  totalLeaves: {
    type: Number,
    default: 24
  },
  leavesTaken: {
    type: Number,
    default: 0
  },
  remainingLeaves: {
    type: Number,
    default: function() {
      return this.totalLeaves - this.leavesTaken;
    }
  },
  // Leave balance by type
  casualLeaves: {
    total: { type: Number, default: 12 },
    taken: { type: Number, default: 0 },
    remaining: { type: Number, default: 12 }
  },
  sickLeaves: {
    total: { type: Number, default: 10 },
    taken: { type: Number, default: 0 },
    remaining: { type: Number, default: 10 }
  },
  earnedLeaves: {
    total: { type: Number, default: 15 },
    taken: { type: Number, default: 0 },
    remaining: { type: Number, default: 15 }
  },
  // Manager relationship
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Team members (for managers)
  teamMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  profileImage: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update remaining leaves before save
userSchema.pre('save', function(next) {
  this.remainingLeaves = this.totalLeaves - this.leavesTaken;
  this.casualLeaves.remaining = this.casualLeaves.total - this.casualLeaves.taken;
  this.sickLeaves.remaining = this.sickLeaves.total - this.sickLeaves.taken;
  this.earnedLeaves.remaining = this.earnedLeaves.total - this.earnedLeaves.taken;
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get user summary
userSchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    department: this.department,
    designation: this.designation,
    employeeId: this.employeeId,
    remainingLeaves: this.remainingLeaves,
    profileImage: this.profileImage,
    isActive: this.isActive
  };
};

module.exports = mongoose.model('User', userSchema);