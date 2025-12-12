const mongoose = require('mongoose');

const leavePolicySchema = new mongoose.Schema({
  policyName: {
    type: String,
    required: true,
    unique: true
  },
  leaveType: {
    type: String,
    required: true,
    enum: ['Casual', 'Sick', 'Earned', 'Maternity', 'Paternity', 'Bereavement', 'Compensatory', 'Unpaid']
  },
  description: String,
  
  // Eligibility
  eligibleRoles: [{
    type: String,
    enum: ['admin', 'hr', 'manager', 'employee']
  }],
  eligibleDepartments: [String],
  minServiceDays: {
    type: Number,
    default: 90
  },
  
  // Limits
  maxDaysPerYear: {
    type: Number,
    required: true
  },
  maxConsecutiveDays: Number,
  maxApplicationsPerMonth: Number,
  
  // Rules
  advanceNoticeDays: {
    type: Number,
    default: 2
  },
  maxDaysInAdvance: Number,
  blackoutPeriods: [{
    name: String,
    startDate: Date,
    endDate: Date,
    reason: String
  }],
  
  // Documentation
  requiresDocumentation: {
    type: Boolean,
    default: false
  },
  documentationTypes: [String],
  
  // Approval
  requiresApproval: {
    type: Boolean,
    default: true
  },
  autoApproveForDays: {
    type: Number,
    default: 0
  },
  approvalWorkflow: {
    type: String,
    enum: ['single', 'multiple', 'hierarchy'],
    default: 'single'
  },
  
  // Carry forward
  allowCarryForward: {
    type: Boolean,
    default: false
  },
  maxCarryForwardDays: Number,
  carryForwardExpiryMonths: Number,
  
  // Encashment
  allowEncashment: Boolean,
  encashmentRules: String,
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  effectiveFrom: Date,
  effectiveTo: Date,
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LeavePolicy', leavePolicySchema);