const Group = require('../models/Group');
const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');

const getUserBalanceInGroup = async (groupId, userId) => {
  let balance = 0;
  
  const expenses = await Expense.find({ group: groupId });
  for (const expense of expenses) {
    for (const payer of expense.paidBy) {
      if (payer.user.toString() === userId) {
        balance += payer.amount;
      }
    }
    for (const split of expense.splits) {
      if (split.user.toString() === userId) {
        balance -= split.amount;
      }
    }
  }
  
  const settlements = await Settlement.find({ group: groupId });
  for (const settlement of settlements) {
    if (settlement.from.toString() === userId) {
      balance += settlement.amount;
    }
    if (settlement.to.toString() === userId) {
      balance -= settlement.amount;
    }
  }
  
  return Math.round(balance * 100) / 100;
};

exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find({ 
      $or: [
        { createdBy: req.user._id },
        { members: req.user._id }
      ]
    })
    .populate('members', 'name email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
    
    
    const groupsWithBalance = await Promise.all(
      groups.map(async (group) => {
        const balance = await getUserBalanceInGroup(group._id, req.user._id.toString());
        return {
          ...group.toObject(),
          userBalance: balance
        };
      })
    );
    
    res.json({ success: true, data: groupsWithBalance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTotalBalance = async (req, res) => {
  try {
    
    const groups = await Group.find({ 
      $or: [
        { createdBy: req.user._id },
        { members: req.user._id }
      ]
    });
    
    let totalBalance = 0;
    
    
    for (const group of groups) {
      const balance = await getUserBalanceInGroup(group._id, req.user._id.toString());
      totalBalance += balance;
    }
    
    
    totalBalance = Math.round(totalBalance * 100) / 100;
    
    res.json({ 
      success: true, 
      data: { 
        balance: totalBalance,
        isOwed: totalBalance > 0,
        isOwing: totalBalance < 0
      } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email')
      .populate('createdBy', 'name email');
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    res.json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const { name, type, startDate, endDate, renewalDate, settleUpReminders } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Group name is required' });
    }

    if (name.trim().length > 50) {
      return res.status(400).json({ error: 'Group name cannot exceed 50 characters' });
    }

    const validTypes = ['Trip', 'Home', 'Family', 'Subscription', 'Other'];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid group type' });
    }
    
    const groupData = {
      name,
      type: type || 'Other',
      members: [req.user._id],
      createdBy: req.user._id,
      settleUpReminders: settleUpReminders || false
    };

    
    if (startDate) groupData.startDate = startDate;
    if (endDate) groupData.endDate = endDate;
    
    
    if (renewalDate) groupData.renewalDate = renewalDate;

    const group = await Group.create(groupData);
    
    await group.populate('members', 'name email');
    await group.populate('createdBy', 'name email');
    
    res.status(201).json({ success: true, data: group });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('members', 'name email')
    .populate('createdBy', 'name email');
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    res.json({ success: true, data: group });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    
    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this group' });
    }
    
    await Group.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { userId, email } = req.body;
    
    if (!userId && !email) {
      return res.status(400).json({ error: 'User ID or email is required' });
    }

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.members.length >= 50) {
      return res.status(400).json({ error: 'Group has reached the maximum of 50 members' });
    }

    const User = require('../models/User');
    let targetUserId = userId;

    if (email && !userId) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      targetUserId = user._id;
    }
    
    if (group.members.map(m => m.toString()).includes(targetUserId.toString())) {
      return res.status(400).json({ error: 'User is already a member' });
    }
    
    group.members.push(targetUserId);
    await group.save();
    
    await group.populate('members', 'name email');
    await group.populate('createdBy', 'name email');
    
    res.json({ success: true, data: group });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    
    if (userId === group.createdBy.toString()) {
      return res.status(400).json({ error: 'Cannot remove the group creator' });
    }
    
    
    const userBalance = await getUserBalanceInGroup(req.params.id, userId);
    if (userBalance !== 0) {
      const status = userBalance > 0 ? 'is owed' : 'owes';
      const amount = Math.abs(userBalance);
      return res.status(400).json({ 
        error: `Cannot remove member: user ${status} €${amount.toFixed(2)} in this group` 
      });
    }
    
    group.members = group.members.filter(m => m.toString() !== userId);
    await group.save();
    
    await group.populate('members', 'name email');
    await group.populate('createdBy', 'name email');
    
    res.json({ success: true, data: group });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
