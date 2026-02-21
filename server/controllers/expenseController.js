const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');
const Group = require('../models/Group');


exports.getGroupExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('paidBy.user', 'name email')
      .populate('splits.user', 'name email')
      .populate('createdBy', 'name email')
      .sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('paidBy.user', 'name email')
      .populate('splits.user', 'name email')
      .populate('createdBy', 'name email');
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.createExpense = async (req, res) => {
  try {
    const { description, amount, groupId, category, splitType, paidBy, splitAmong } = req.body;

    // Validate group exists and user is a member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isMember = group.members.some(m => m.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    // Validate paidBy users are group members
    for (const payer of paidBy) {
      if (!group.members.some(m => m.toString() === payer.user.toString())) {
        return res.status(400).json({ error: `Payer ${payer.user} is not a group member` });
      }
    }

    // Validate paidBy amounts sum to total
    const paidTotal = paidBy.reduce((sum, p) => sum + p.amount, 0);
    if (Math.abs(paidTotal - amount) > 0.01) {
      return res.status(400).json({ error: 'Paid amounts must sum to the total expense amount' });
    }

    // Calculate splits based on splitType
    let splits = [];

    if (splitType === 'equal' || !splitType) {
      // For equal splits, splitAmong can be array of user IDs or undefined (use all group members)
      const participants = splitAmong || group.members.map(m => m.toString());
      
      // Validate all split participants are group members
      for (const userId of participants) {
        const userIdStr = typeof userId === 'object' ? userId.user?.toString() : userId.toString();
        if (!group.members.some(m => m.toString() === userIdStr)) {
          return res.status(400).json({ error: `User ${userIdStr} is not a group member` });
        }
      }
      
      const perPerson = Math.round((amount / participants.length) * 100) / 100;
      // Handle rounding: give the remainder to the first person
      let remainder = Math.round((amount - perPerson * participants.length) * 100) / 100;
      splits = participants.map((userId, i) => ({
        user: typeof userId === 'object' ? userId.user : userId,
        amount: i === 0 ? perPerson + remainder : perPerson
      }));
    } else if (splitType === 'exact') {
      // splitAmong should be [{ user, amount }] for exact splits
      if (!Array.isArray(splitAmong) || !splitAmong[0]?.amount) {
        return res.status(400).json({ error: 'Exact split requires amounts for each participant' });
      }
      
      // Validate all split participants are group members
      for (const split of splitAmong) {
        const userIdStr = split.user?.toString();
        if (!group.members.some(m => m.toString() === userIdStr)) {
          return res.status(400).json({ error: `User ${userIdStr} is not a group member` });
        }
      }
      
      const splitTotal = splitAmong.reduce((sum, s) => sum + s.amount, 0);
      if (Math.abs(splitTotal - amount) > 0.01) {
        return res.status(400).json({ error: 'Split amounts must sum to the total expense amount' });
      }
      splits = splitAmong.map(s => ({ user: s.user, amount: s.amount }));
    } else if (splitType === 'percentage') {
      if (!Array.isArray(splitAmong) || !splitAmong[0]?.percentage) {
        return res.status(400).json({ error: 'Percentage split requires percentages for each participant' });
      }
      
      // Validate all split participants are group members
      for (const split of splitAmong) {
        const userIdStr = split.user?.toString();
        if (!group.members.some(m => m.toString() === userIdStr)) {
          return res.status(400).json({ error: `User ${userIdStr} is not a group member` });
        }
      }
      
      const totalPct = splitAmong.reduce((sum, s) => sum + s.percentage, 0);
      if (Math.abs(totalPct - 100) > 0.01) {
        return res.status(400).json({ error: 'Percentages must sum to 100' });
      }
      splits = splitAmong.map(s => ({
        user: s.user,
        amount: Math.round((amount * s.percentage / 100) * 100) / 100
      }));
    }

    const expense = new Expense({
      description,
      amount,
      group: groupId,
      category,
      splitType: splitType || 'equal',
      paidBy,
      splits,
      createdBy: req.user._id
    });

    await expense.save();
    await expense.populate('paidBy.user', 'name email');
    await expense.populate('splits.user', 'name email');
    await expense.populate('createdBy', 'name email');

    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Only creator can update
    if (expense.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the creator can update this expense' });
    }

    Object.assign(expense, req.body);
    await expense.save();
    await expense.populate('paidBy.user', 'name email');
    await expense.populate('splits.user', 'name email');

    res.json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Only creator can delete
    if (expense.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the creator can delete this expense' });
    }

    await expense.deleteOne();
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getGroupBalances = async (req, res) => {
  try {
    const groupId = req.params.groupId;

    const group = await Group.findById(groupId).populate('members', 'name email');
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Initialize balances: for each pair of members, track net amount
    const balances = {};
    group.members.forEach(m => {
      balances[m._id.toString()] = { user: m, total: 0 };
    });

    // Process expenses
    const expenses = await Expense.find({ group: groupId });
    for (const expense of expenses) {
      // For each payer, they are owed their payment amount
      for (const payer of expense.paidBy) {
        const payerId = payer.user.toString();
        if (balances[payerId]) {
          balances[payerId].total += payer.amount;
        }
      }
      // For each split participant, they owe their share
      for (const split of expense.splits) {
        const userId = split.user.toString();
        if (balances[userId]) {
          balances[userId].total -= split.amount;
        }
      }
    }

    // Process settlements
    const settlements = await Settlement.find({ group: groupId });
    for (const settlement of settlements) {
      const fromId = settlement.from.toString();
      const toId = settlement.to.toString();
      // from paid to, so from's balance goes up, to's goes down
      if (balances[fromId]) balances[fromId].total += settlement.amount;
      if (balances[toId]) balances[toId].total -= settlement.amount;
    }

    // Convert to array and round
    const result = Object.values(balances).map(b => ({
      user: b.user,
      balance: Math.round(b.total * 100) / 100
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
