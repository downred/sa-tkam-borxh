const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// All user routes require authentication
router.get('/users', auth, userController.getAllUsers);
router.get('/users/:id', auth, userController.getUserById);
router.post('/users', auth, userController.createUser);
router.put('/users/:id', auth, userController.updateUser);
router.delete('/users/:id', auth, userController.deleteUser);

// Friend routes (protected)
router.get('/friends', auth, userController.getFriends);
router.post('/friends', auth, userController.addFriend);
router.delete('/friends/:friendId', auth, userController.removeFriend);

module.exports = router;
