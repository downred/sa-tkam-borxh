const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Trip', 'Home', 'Family', 'Subscription', 'Other'],
    default: 'Other'
  },
  // Trip-specific fields
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  // Subscription-specific field
  renewalDate: {
    type: Date
  },
  // Reminders
  settleUpReminders: {
    type: Boolean,
    default: false
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Group', GroupSchema);
