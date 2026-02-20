const User = require('../models/User');


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.addFriend = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user.id;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const friend = await User.findOne({ email: email.toLowerCase() });
    if (!friend) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (userId === friend._id.toString()) {
      return res.status(400).json({ error: 'Cannot add yourself as a friend' });
    }

    const user = await User.findById(userId);
    if (user.friends.includes(friend._id)) {
      return res.status(400).json({ error: 'User is already a friend' });
    }

    user.friends.push(friend._id);
    await user.save();

    res.json({ message: 'Friend added successfully', friend: { _id: friend._id, name: friend.name, email: friend.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user.friends.includes(friendId)) {
      return res.status(400).json({ error: 'User is not in your friends list' });
    }

    user.friends = user.friends.filter(id => id.toString() !== friendId);
    await user.save();

    res.json({ message: 'Friend removed successfully', friends: user.friends });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getFriends = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('friends', 'name email phone');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
