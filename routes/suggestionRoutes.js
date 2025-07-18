const express = require('express');
const router = express.Router();
const { suggestSkills, getGoals } = require('../controllers/suggestionController');
const { protect } = require('../middleware/authMiddleware');
const { validateSuggestSkills } = require('../validators/suggestionValidator');

router.get('/skills', protect, validateSuggestSkills, suggestSkills);
router.get('/goals', getGoals);

module.exports = router;