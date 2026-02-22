const Settlement = require('../models/Settlement');
const Group = require('../models/Group');
const { logActivity } = require('./activityController');


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
    const { groupId, to, from, amount } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Determine from/to based on what's provided
    // If 'from' is specified, logged-in user is the recipient (recording payment received)
    // If 'to' is specified, logged-in user is the payer (recording payment made)
    const loggedInUserId = req.user._id.toString();
    let fromUserId, toUserId;

    if (from) {
      // Recording payment received: logged-in user is recipient
      fromUserId = from;
      toUserId = loggedInUserId;
    } else if (to) {
      // Recording payment made: logged-in user is payer
      fromUserId = loggedInUserId;
      toUserId = to;
    } else {
      return res.status(400).json({ error: 'Must specify either from or to user' });
    }

    // Verify logged-in user is a member
    const isMember = group.members.some(m => m.toString() === loggedInUserId);
    if (!isMember) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    // Verify the other party is a member
    const otherUserId = from || to;
    const otherIsMember = group.members.some(m => m.toString() === otherUserId);
    if (!otherIsMember) {
      return res.status(400).json({ error: 'The other user is not a member of this group' });
    }

    if (fromUserId === toUserId) {
      return res.status(400).json({ error: 'Cannot settle with yourself' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    const settlement = new Settlement({
      group: groupId,
      from: fromUserId,
      to: toUserId,
      amount
    });

    await settlement.save();
    await settlement.populate('from', 'name email');
    await settlement.populate('to', 'name email');

    // Log activity
    await logActivity({
      group: groupId,
      user: req.user._id,
      type: 'settlement_added',
      description: `recorded €${amount.toFixed(2)} payment from ${settlement.from.name} to ${settlement.to.name}`,
      metadata: {
        entityId: settlement._id,
        entityType: 'settlement',
        amount,
        involvedUsers: [fromUserId, toUserId]
      }
    });

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

    // Only the recipient (to) can delete - they recorded the payment
    if (settlement.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the recipient can delete this settlement' });
    }

    // Store info for activity log before deletion
    const groupId = settlement.group;
    const deletedAmount = settlement.amount;
    await settlement.populate('from', 'name email');
    await settlement.populate('to', 'name email');
    const fromName = settlement.from.name;
    const toName = settlement.to.name;

    await settlement.deleteOne();

    // Log activity
    await logActivity({
      group: groupId,
      user: req.user._id,
      type: 'settlement_deleted',
      description: `deleted €${deletedAmount.toFixed(2)} payment from ${fromName} to ${toName}`,
      metadata: {
        entityType: 'settlement',
        amount: deletedAmount
      }
    });

    res.json({ message: 'Settlement deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.updateSettlement = async (req, res) => {
  try {
    const { amount } = req.body;
    
    const settlement = await Settlement.findById(req.params.id);
    if (!settlement) {
      return res.status(404).json({ error: 'Settlement not found' });
    }

    // Only the recipient (to) can update - they recorded the payment
    if (settlement.to.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the recipient can update this settlement' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    const previousAmount = settlement.amount;
    settlement.amount = amount;
    await settlement.save();
    await settlement.populate('from', 'name email');
    await settlement.populate('to', 'name email');

    // Log activity
    await logActivity({
      group: settlement.group,
      user: req.user._id,
      type: 'settlement_edited',
      description: `updated payment ${settlement.from.name} → ${settlement.to.name}: €${previousAmount.toFixed(2)} → €${amount.toFixed(2)}`,
      metadata: {
        entityId: settlement._id,
        entityType: 'settlement',
        amount,
        previousAmount
      }
    });

    res.json(settlement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
