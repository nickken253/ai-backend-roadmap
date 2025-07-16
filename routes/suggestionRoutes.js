const express = require("express");
const router = express.Router();
const {
  suggestSkills,
  getGoals,
} = require("../controllers/suggestionController");
const { protect } = require("../middleware/authMiddleware");

router.get('/skills', protect, suggestSkills);

router.get('/goals', getGoals);

module.exports = router;
