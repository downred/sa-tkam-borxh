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
    
    entityId: mongoose.Schema.Types.Mixed,  
    entityType: String,                         
    amount: Number,
    previousAmount: Number,                     
    description: String,                        
    previousDescription: String,                
    involvedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }
}, {
  timestamps: true
});

activitySchema.index({ group: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);
