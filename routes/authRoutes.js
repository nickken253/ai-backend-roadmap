const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);

router.post('/login', loginUser);

router.get('/me', protect, getUserProfile);

router.put('/me/profile', protect, updateUserProfile);

router.put('/me/password', protect, changePassword);

module.exports = router;