const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/groups/:groupId/expenses', expenseController.getGroupExpenses);
router.get('/groups/:groupId/balances', expenseController.getGroupBalances);
router.get('/groups/:groupId/simplified-debts', expenseController.getSimplifiedDebts);
router.get('/groups/:groupId/integrity', expenseController.checkGroupIntegrity);
router.get('/expenses/:id', expenseController.getExpenseById);
router.post('/expenses', expenseController.createExpense);
router.put('/expenses/:id', expenseController.updateExpense);
router.delete('/expenses/:id', expenseController.deleteExpense);

module.exports = router;
