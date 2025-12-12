const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    enum: ['employee', 'manager', 'hr', 'admin'],
    default: 'employee'
  },
  department: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  contactNumber: String,
  address: String,
  dateOfBirth: Date,
  gender: String,
  
  // Leave balances with proper defaults
  totalLeaves: {
    type: Number,
    default: 30
  },
  leavesTaken: {
    type: Number,
    default: 0
  },
  remainingLeaves: {
    type: Number,
    default: 30
  },
  
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
  
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date
}, {
  timestamps: true
});

// Update remaining leaves before save
userSchema.pre('save', function(next) {
  this.remainingLeaves = this.totalLeaves - this.leavesTaken;
  
  if (this.casualLeaves) {
    this.casualLeaves.remaining = this.casualLeaves.total - this.casualLeaves.taken;
  }
  
  if (this.sickLeaves) {
    this.sickLeaves.remaining = this.sickLeaves.total - this.sickLeaves.taken;
  }
  
  if (this.earnedLeaves) {
    this.earnedLeaves.remaining = this.earnedLeaves.total - this.earnedLeaves.taken;
  }
  
  next();
});

module.exports = mongoose.model('User', userSchema);