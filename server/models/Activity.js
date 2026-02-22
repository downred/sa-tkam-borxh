const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'expense_added',
      'expense_edited',
      'expense_deleted',
      'settlement_added',
      'settlement_edited',
      'settlement_deleted',
      'member_added',
      'member_removed'
    ]
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    // Store relevant data about the activity
    entityId: mongoose.Schema.Types.Mixed,  // ID of expense/settlement (Mixed to support test mock IDs)
    entityType: String,                         // 'expense' or 'settlement'
    amount: Number,
    previousAmount: Number,                     // For edits
    description: String,                        // Expense description
    previousDescription: String,                // For edits
    involvedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }
}, {
  timestamps: true
});

// Index for efficient querying by group and time
activitySchema.index({ group: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
