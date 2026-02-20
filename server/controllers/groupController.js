const Group = require('../models/Group');

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
    
    res.json({ success: true, data: groups });
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
    
    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }
    
    const groupData = {
      name,
      type: type || 'Other',
      members: [req.user._id],
      createdBy: req.user._id,
      settleUpReminders: settleUpReminders || false
    };

    // Add trip-specific fields
    if (startDate) groupData.startDate = startDate;
    if (endDate) groupData.endDate = endDate;
    
    // Add subscription-specific field
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
    
    // Only creator can delete
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
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    if (group.members.includes(userId)) {
      return res.status(400).json({ error: 'User is already a member' });
    }
    
    group.members.push(userId);
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
    
    // Cannot remove the creator
    if (userId === group.createdBy.toString()) {
      return res.status(400).json({ error: 'Cannot remove the group creator' });
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
