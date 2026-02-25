const express = require('express');
const router = express.Router();
const { getGroupActivities } = require('../controllers/activityController');
const auth = require('../middleware/auth');

router.get('/groups/:groupId', auth, getGroupActivities);

module.exports = router;
