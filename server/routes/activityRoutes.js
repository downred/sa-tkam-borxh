const express = require('express');
const router = express.Router();
const { getGroupActivities } = require('../controllers/activityController');
const auth = require('../middleware/auth');

// Get activities for a group
router.get('/groups/:groupId', auth, getGroupActivities);

module.exports = router;
