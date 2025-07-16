const express = require('express');
const router = express.Router();
const { getPromptLogs, getUsers } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);
router.get('/logs', getPromptLogs);
router.get('/users', getUsers);

module.exports = router;