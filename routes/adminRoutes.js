const express = require('express');
const cache = require('../middleware/cacheMiddleware');
const { CACHE_DURATIONS } = require('../config/constants');
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
router.get('/stats/dashboard', cache(CACHE_DURATIONS.TEN_MINUTES), getDashboardStats);
router.get('/stats/popular-goals', cache(CACHE_DURATIONS.ONE_HOUR), getPopularGoals);
router.get('/stats/study-time', cache(CACHE_DURATIONS.ONE_HOUR), getStudyTimeStats);
router.get('/stats/popular-skills', cache(CACHE_DURATIONS.ONE_HOUR), getPopularSkills);

module.exports = router;