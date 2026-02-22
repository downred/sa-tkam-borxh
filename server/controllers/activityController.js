const Activity = require('../models/Activity');
const Group = require('../models/Group');

// Get activities for a group
const getGroupActivities = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { limit = 50, before } = req.query;

    // Verify user is member of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    const isMember = group.members.some(
      member => member.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    // Build query
    const query = { group: groupId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('user', 'name email')
      .populate('metadata.involvedUsers', 'name email');

    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};

// Helper function to log activity (used by other controllers)
const logActivity = async ({ group, user, type, description, metadata = {} }) => {
  try {
    // Skip logging if required fields are missing (e.g., in tests with mocks)
    if (!group || !user || !type || !description) {
      return null;
    }
    
    const activity = new Activity({
      group,
      user,
      type,
      description,
      metadata
    });
    await activity.save();
    return activity;
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - activity logging shouldn't break main operations
    return null;
  }
};

module.exports = {
  getGroupActivities,
  logActivity
};
