const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');
const Group = require('../models/Group');
const { logActivity } = require('./activityController');

const validateExpenseZeroSum = (paidBy, splits, amount) => {
  const paidTotal = paidBy.reduce((sum, p) => sum + p.amount, 0);
  const splitTotal = splits.reduce((sum, s) => sum + s.amount, 0);
  
  
  if (Math.abs(paidTotal - amount) > 0.01) {
    return { valid: false, error: `Paid total (€${paidTotal.toFixed(2)}) doesn't match expense amount (€${amount.toFixed(2)})` };
  }
  if (Math.abs(splitTotal - amount) > 0.01) {
    return { valid: false, error: `Split total (€${splitTotal.toFixed(2)}) doesn't match expense amount (€${amount.toFixed(2)})` };
  }
  
  if (Math.abs(paidTotal - splitTotal) > 0.01) {
    return { valid: false, error: `Zero-sum violation: paid (€${paidTotal.toFixed(2)}) != splits (€${splitTotal.toFixed(2)})` };
  }
  return { valid: true };
};

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

    
    if (!description || description.trim() === '') {
      return res.status(400).json({ error: 'Description is required' });
    }

    
    if (amount === undefined || amount === null || amount === '') {
      return res.status(400).json({ error: 'Amount is required' });
    }
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
      return res.status(400).json({ error: 'Amount must be a valid number' });
    }
    if (numericAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isMember = group.members.some(m => m.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    
    for (const payer of paidBy) {
      if (!group.members.some(m => m.toString() === payer.user.toString())) {
        return res.status(400).json({ error: `Payer ${payer.user} is not a group member` });
      }
    }

    
    const paidTotal = paidBy.reduce((sum, p) => sum + p.amount, 0);
    if (Math.abs(paidTotal - amount) > 0.01) {
      return res.status(400).json({ error: 'Paid amounts must sum to the total expense amount' });
    }

    
    let splits = [];

    if (splitType === 'equal' || !splitType) {
      
      const participants = splitAmong || group.members.map(m => m.toString());
      
      
      if (!participants || participants.length === 0) {
        return res.status(400).json({ error: 'Equal split requires at least one participant' });
      }
      
      
      for (const userId of participants) {
        const userIdStr = typeof userId === 'object' ? userId.user?.toString() : userId.toString();
        if (!group.members.some(m => m.toString() === userIdStr)) {
          return res.status(400).json({ error: `User ${userIdStr} is not a group member` });
        }
      }
      
      const perPerson = Math.round((amount / participants.length) * 100) / 100;
      
      let remainder = Math.round((amount - perPerson * participants.length) * 100) / 100;
      splits = participants.map((userId, i) => ({
        user: typeof userId === 'object' ? userId.user : userId,
        amount: i === 0 ? perPerson + remainder : perPerson
      }));
    } else if (splitType === 'exact') {
      
      if (!Array.isArray(splitAmong) || !splitAmong[0]?.amount) {
        return res.status(400).json({ error: 'Exact split requires amounts for each participant' });
      }
      
      
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
    } else if (splitType === 'shares') {
      
      if (!Array.isArray(splitAmong) || splitAmong[0]?.shares === undefined) {
        return res.status(400).json({ error: 'Shares split requires shares for each participant' });
      }

      
      for (const split of splitAmong) {
        const userIdStr = split.user?.toString();
        if (!group.members.some(m => m.toString() === userIdStr)) {
          return res.status(400).json({ error: `User ${userIdStr} is not a group member` });
        }
      }

      const totalShares = splitAmong.reduce((sum, s) => sum + s.shares, 0);
      if (totalShares <= 0) {
        return res.status(400).json({ error: 'Total shares must be greater than 0' });
      }

      
      let calculatedSplits = splitAmong.map(s => ({
        user: s.user,
        amount: Math.round((amount * s.shares / totalShares) * 100) / 100
      }));

      
      const splitSum = calculatedSplits.reduce((sum, s) => sum + s.amount, 0);
      const remainder = Math.round((amount - splitSum) * 100) / 100;
      if (Math.abs(remainder) > 0) {
        calculatedSplits[0].amount += remainder;
      }

      splits = calculatedSplits;
    }

    
    const zeroSumCheck = validateExpenseZeroSum(paidBy, splits, amount);
    if (!zeroSumCheck.valid) {
      return res.status(400).json({ error: zeroSumCheck.error });
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

    
    await logActivity({
      group: groupId,
      user: req.user._id,
      type: 'expense_added',
      description: `added "${description}" for €${Math.abs(amount).toFixed(2)}`,
      metadata: {
        entityId: expense._id,
        entityType: 'expense',
        amount,
        description,
        involvedUsers: [...new Set([...paidBy.map(p => p.user), ...splits.map(s => s.user)])]
      }
    });

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

    
    if (expense.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the creator can update this expense' });
    }

    
    const group = await Group.findById(expense.group);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    
    if (req.body.paidBy) {
      for (const payer of req.body.paidBy) {
        const payerId = payer.user?.toString() || payer.user;
        if (!group.members.some(m => m.toString() === payerId)) {
          return res.status(400).json({ error: `Payer ${payerId} is not a group member` });
        }
      }
    }

    
    if (req.body.splits) {
      for (const split of req.body.splits) {
        const userId = split.user?.toString() || split.user;
        if (!group.members.some(m => m.toString() === userId)) {
          return res.status(400).json({ error: `User ${userId} in splits is not a group member` });
        }
      }
    }

    
    const newPaidBy = req.body.paidBy || expense.paidBy;
    const newSplits = req.body.splits || expense.splits;
    const newAmount = req.body.amount || expense.amount;

    if (req.body.paidBy || req.body.splits || req.body.amount) {
      const zeroSumCheck = validateExpenseZeroSum(newPaidBy, newSplits, newAmount);
      if (!zeroSumCheck.valid) {
        return res.status(400).json({ error: zeroSumCheck.error });
      }
    }

    
    const previousAmount = expense.amount;
    const previousDescription = expense.description;
    const previousPaidBy = JSON.stringify(expense.paidBy.map(p => ({ user: p.user.toString(), amount: p.amount })));
    const previousSplits = JSON.stringify(expense.splits.map(s => ({ user: s.user.toString(), amount: s.amount })));

    Object.assign(expense, req.body);
    await expense.save();
    await expense.populate('paidBy.user', 'name email');
    await expense.populate('splits.user', 'name email');

    
    const getUserId = (user) => user?._id?.toString() || user?.toString() || user;
    const newPaidByStr = JSON.stringify(expense.paidBy.map(p => ({ user: getUserId(p.user), amount: p.amount })));
    const newSplitsStr = JSON.stringify(expense.splits.map(s => ({ user: getUserId(s.user), amount: s.amount })));

    
    const changes = [];
    if (previousDescription !== expense.description) {
      changes.push(`renamed "${previousDescription}" → "${expense.description}"`);
    }
    if (Math.abs(previousAmount - expense.amount) > 0.01) {
      changes.push(`amount €${previousAmount.toFixed(2)} → €${expense.amount.toFixed(2)}`);
    }
    if (previousPaidBy !== newPaidByStr) changes.push('updated payers');
    if (previousSplits !== newSplitsStr) changes.push('updated split');
    
    const changeDesc = changes.length > 0 
      ? changes.join(', ')
      : `updated "${expense.description}"`;

    
    await logActivity({
      group: expense.group,
      user: req.user._id,
      type: 'expense_edited',
      description: changeDesc,
      metadata: {
        entityId: expense._id,
        entityType: 'expense',
        amount: expense.amount,
        previousAmount,
        description: expense.description,
        previousDescription
      }
    });

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

    
    if (expense.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Only the creator can delete this expense' });
    }

    
    const balanceImpact = [];
    for (const payer of expense.paidBy) {
      balanceImpact.push({
        user: payer.user,
        change: -payer.amount, 
        reason: 'was payer'
      });
    }
    for (const split of expense.splits) {
      const existing = balanceImpact.find(b => b.user.toString() === split.user.toString());
      if (existing) {
        existing.change += split.amount; 
      } else {
        balanceImpact.push({
          user: split.user,
          change: split.amount, 
          reason: 'was in split'
        });
      }
    }

    
    const deletedDescription = expense.description;
    const deletedAmount = expense.amount;
    const groupId = expense.group;

    await expense.deleteOne();

    
    await logActivity({
      group: groupId,
      user: req.user._id,
      type: 'expense_deleted',
      description: `deleted "${deletedDescription}" (€${Math.abs(deletedAmount).toFixed(2)})`,
      metadata: {
        entityType: 'expense',
        amount: deletedAmount,
        description: deletedDescription
      }
    });
    
    res.json({ 
      message: 'Expense deleted successfully',
      deletedExpense: {
        description: expense.description,
        amount: expense.amount
      },
      balanceImpact: balanceImpact.filter(b => Math.abs(b.change) > 0.01).map(b => ({
        user: b.user,
        change: Math.round(b.change * 100) / 100
      }))
    });
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

    
    const balances = {};
    group.members.forEach(m => {
      balances[m._id.toString()] = { user: m, total: 0 };
    });

    
    const expenses = await Expense.find({ group: groupId });
    for (const expense of expenses) {
      
      for (const payer of expense.paidBy) {
        const payerId = payer.user.toString();
        if (balances[payerId]) {
          balances[payerId].total += payer.amount;
        }
      }
      
      for (const split of expense.splits) {
        const userId = split.user.toString();
        if (balances[userId]) {
          balances[userId].total -= split.amount;
        }
      }
    }

    
    const settlements = await Settlement.find({ group: groupId });
    for (const settlement of settlements) {
      const fromId = settlement.from.toString();
      const toId = settlement.to.toString();
      
      if (balances[fromId]) balances[fromId].total += settlement.amount;
      if (balances[toId]) balances[toId].total -= settlement.amount;
    }

    
    const result = Object.values(balances).map(b => ({
      user: b.user,
      balance: Math.round(b.total * 100) / 100
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSimplifiedDebts = async (req, res) => {
  try {
    const groupId = req.params.groupId;

    const group = await Group.findById(groupId).populate('members', 'name email');
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    
    const balances = {};
    group.members.forEach(m => {
      balances[m._id.toString()] = { user: m, total: 0 };
    });

    const expenses = await Expense.find({ group: groupId });
    for (const expense of expenses) {
      for (const payer of expense.paidBy) {
        const payerId = payer.user.toString();
        if (balances[payerId]) balances[payerId].total += payer.amount;
      }
      for (const split of expense.splits) {
        const userId = split.user.toString();
        if (balances[userId]) balances[userId].total -= split.amount;
      }
    }

    const settlements = await Settlement.find({ group: groupId });
    for (const settlement of settlements) {
      const fromId = settlement.from.toString();
      const toId = settlement.to.toString();
      if (balances[fromId]) balances[fromId].total += settlement.amount;
      if (balances[toId]) balances[toId].total -= settlement.amount;
    }

    
    const creditors = [];
    const debtors = [];
    
    for (const [userId, data] of Object.entries(balances)) {
      const rounded = Math.round(data.total * 100) / 100;
      if (rounded > 0.01) {
        creditors.push({ user: data.user, amount: rounded });
      } else if (rounded < -0.01) {
        debtors.push({ user: data.user, amount: Math.abs(rounded) });
      }
      
    }

    
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    
    const simplifiedTransactions = [];
    let i = 0, j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      
      const amount = Math.min(debtor.amount, creditor.amount);
      const roundedAmount = Math.round(amount * 100) / 100;
      
      if (roundedAmount > 0) {
        simplifiedTransactions.push({
          from: debtor.user,
          to: creditor.user,
          amount: roundedAmount
        });
      }

      debtor.amount -= amount;
      creditor.amount -= amount;

      
      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    res.json({
      transactions: simplifiedTransactions,
      transactionCount: simplifiedTransactions.length,
      summary: `${simplifiedTransactions.length} payment${simplifiedTransactions.length !== 1 ? 's' : ''} needed to settle all debts`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.checkGroupIntegrity = async (req, res) => {
  try {
    const groupId = req.params.groupId;

    const group = await Group.findById(groupId).populate('members', 'name email');
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const issues = [];

    
    const expenses = await Expense.find({ group: groupId });
    for (const expense of expenses) {
      const paidTotal = expense.paidBy.reduce((sum, p) => sum + p.amount, 0);
      const splitTotal = expense.splits.reduce((sum, s) => sum + s.amount, 0);

      if (Math.abs(paidTotal - expense.amount) > 0.01) {
        issues.push({
          type: 'expense_paid_mismatch',
          expenseId: expense._id,
          description: expense.description,
          message: `Paid total (€${paidTotal.toFixed(2)}) doesn't match amount (€${expense.amount.toFixed(2)})`
        });
      }

      if (Math.abs(splitTotal - expense.amount) > 0.01) {
        issues.push({
          type: 'expense_split_mismatch',
          expenseId: expense._id,
          description: expense.description,
          message: `Split total (€${splitTotal.toFixed(2)}) doesn't match amount (€${expense.amount.toFixed(2)})`
        });
      }
    }

    
    const balances = {};
    group.members.forEach(m => {
      balances[m._id.toString()] = 0;
    });

    for (const expense of expenses) {
      for (const payer of expense.paidBy) {
        const payerId = payer.user.toString();
        if (balances[payerId] !== undefined) {
          balances[payerId] += payer.amount;
        }
      }
      for (const split of expense.splits) {
        const userId = split.user.toString();
        if (balances[userId] !== undefined) {
          balances[userId] -= split.amount;
        }
      }
    }

    
    const settlements = await Settlement.find({ group: groupId });
    for (const settlement of settlements) {
      const fromId = settlement.from.toString();
      const toId = settlement.to.toString();
      if (balances[fromId] !== undefined) balances[fromId] += settlement.amount;
      if (balances[toId] !== undefined) balances[toId] -= settlement.amount;
    }

    
    const totalBalance = Object.values(balances).reduce((sum, b) => sum + b, 0);
    const roundedTotal = Math.round(totalBalance * 100) / 100;

    if (Math.abs(roundedTotal) > 0.01) {
      issues.push({
        type: 'group_balance_nonzero',
        message: `Group balances sum to €${roundedTotal.toFixed(2)} instead of €0.00`,
        balances: Object.entries(balances).map(([userId, balance]) => {
          const member = group.members.find(m => m._id.toString() === userId);
          return { user: member?.name || userId, balance: Math.round(balance * 100) / 100 };
        })
      });
    }

    res.json({
      valid: issues.length === 0,
      groupId,
      expenseCount: expenses.length,
      settlementCount: settlements.length,
      totalBalance: roundedTotal,
      issues,
      message: issues.length === 0 
        ? 'Zero-sum integrity verified: all balances sum to €0.00' 
        : `Found ${issues.length} integrity issue(s)`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
