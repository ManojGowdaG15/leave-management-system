const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  leaveType: {
    type: String,
    enum: ['Casual', 'Sick', 'Earned', 'Maternity', 'Paternity', 'Bereavement', 'Compensatory', 'Unpaid'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  numberOfDays: {
    type: Number,
    default: 1
  },
  reason: {
    type: String,
    required: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String,
  
  // Half day options
  isHalfDay: {
    type: Boolean,
    default: false
  },
  halfDayType: {
    type: String,
    enum: ['first-half', 'second-half'],
    default: 'first-half'
  },
  
  // Contact during leave
  contactDuringLeave: String,
  alternateContact: String,
  
  // Documents
  supportingDocuments: [{
    fileName: String,
    filePath: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Work handover
  workHandoverTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  handoverNotes: String,
  
  // For tracking
  appliedOn: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Multi-level approval tracking
  currentApprover: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalChain: [{
    approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    comments: String,
    actionAt: Date
  }]
}, {
  timestamps: true
});

// Calculate number of days before saving
leaveSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(new Date(this.endDate) - new Date(this.startDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.numberOfDays = this.isHalfDay ? 0.5 : diffDays + 1;
  }
  this.updatedAt = Date.now();
  next();
});

// Virtual for checking if leave is in past
leaveSchema.virtual('isPast').get(function() {
  return new Date(this.endDate) < new Date();
});

// Virtual for checking if leave is ongoing
leaveSchema.virtual('isOngoing').get(function() {
  const now = new Date();
  return new Date(this.startDate) <= now && new Date(this.endDate) >= now;
});

module.exports = mongoose.model('Leave', leaveSchema);