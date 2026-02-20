const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');


router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

// Friend routes (protected)
router.get('/friends', auth, userController.getFriends);
router.post('/friends', auth, userController.addFriend);
router.delete('/friends/:friendId', auth, userController.removeFriend);

module.exports = router;
