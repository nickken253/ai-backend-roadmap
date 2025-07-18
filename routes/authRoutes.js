const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { 
    validateRegistration, 
    validateLogin, 
    validateProfileUpdate, 
    validatePasswordChange 
} = require('../validators/authValidator');

router.post('/register', validateRegistration, registerUser);
router.post('/login', validateLogin, loginUser);
router.get('/me', protect, getUserProfile);
router.put('/me/profile', protect, validateProfileUpdate, updateUserProfile);
router.put('/me/password', protect, validatePasswordChange, changePassword);

module.exports = router;