const Settlement = require('../models/Settlement');
const Group = require('../models/Group');


exports.getGroupSettlements = async (req, res) => {
  try {
    const settlements = await Settlement.find({ group: req.params.groupId })
      .populate('from', 'name email')
      .populate('to', 'name email')
      .sort({ createdAt: -1 });
    res.json(settlements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.createSettlement = async (req, res) => {
  try {
    const { groupId, to, amount } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const fromId = req.user._id.toString();
    const isMember = group.members.some(m => m.toString() === fromId);
    if (!isMember) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    const toIsMember = group.members.some(m => m.toString() === to);
    if (!toIsMember) {
      return res.status(400).json({ error: 'Recipient is not a member of this group' });
    }

    if (fromId === to) {
      return res.status(400).json({ error: 'Cannot settle with yourself' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    const settlement = new Settlement({
      group: groupId,
      from: req.user._id,
      to,
      amount
    });

    await settlement.save();
    await settlement.populate('from', 'name email');
    await settlement.populate('to', 'name email');

    res.status(201).json(settlement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.deleteSettlement = async (req, res) => {
  try {
    const settlement = await Settlement.findById(req.params.id);
    if (!settlement) {
      return res.status(404).json({ error: 'Settlement not found' });
    }

    // Only the person who created it can delete
    if (settlement.from.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the sender can delete this settlement' });
    }

    await settlement.deleteOne();
    res.json({ message: 'Settlement deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
