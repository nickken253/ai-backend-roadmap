const express = require('express');
const router = express.Router();
const { 
    getPromptLogs, 
    getPromptLogById,
    getUsers,
    getUserById,
    updateUserStatus,
    updateUserRole,
    getDashboardStats,
    getPopularGoals,
    getStudyTimeStats,
    getPopularSkills,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);

// Log routes
router.get('/logs', getPromptLogs);
router.get('/logs/:id', getPromptLogById);

// User management routes
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/role', updateUserRole);

// Stats routes
router.get('/stats/dashboard', getDashboardStats);
router.get('/stats/popular-goals', getPopularGoals);
router.get('/stats/study-time', getStudyTimeStats);
router.get('/stats/popular-skills', getPopularSkills);

module.exports = router;