const express = require('express');
const router = express.Router();
const settlementController = require('../controllers/settlementController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/groups/:groupId/settlements', settlementController.getGroupSettlements);
router.post('/settlements', settlementController.createSettlement);
router.put('/settlements/:id', settlementController.updateSettlement);
router.delete('/settlements/:id', settlementController.deleteSettlement);

module.exports = router;
