const express = require('express');
const router = express.Router();
const { generateRoadmap, getRoadmapHistory, getRoadmapById, deleteRoadmap, reviewRoadmap, updateRoadmap } = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');
const { validateRoadmapGeneration, validateMongoId } = require('../validators/roadmapValidator');

router.post('/generate', protect, validateRoadmapGeneration, generateRoadmap);
router.get('/', protect, getRoadmapHistory);
router.get('/:id', protect, validateMongoId('id'), getRoadmapById);
router.delete('/:id', protect, validateMongoId('id'), deleteRoadmap);
router.post('/review', protect, reviewRoadmap);
router.put('/:id', protect, validateMongoId('id'), updateRoadmap);

module.exports = router;