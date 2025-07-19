const express = require('express');
const router = express.Router();
const { suggestSkills, getGoals } = require('../controllers/suggestionController');
const { protect } = require('../middleware/authMiddleware');
const { validateSuggestSkills } = require('../validators/suggestionValidator');
const cache = require('../middleware/cacheMiddleware');
const { CACHE_DURATIONS } = require('../config/constants');

router.get('/skills', protect, cache(CACHE_DURATIONS.ONE_DAY), validateSuggestSkills, suggestSkills);
router.get('/goals', cache(CACHE_DURATIONS.ONE_HOUR), getGoals);

module.exports = router;