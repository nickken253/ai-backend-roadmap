const express = require('express');
const router = express.Router();
const { generateRoadmap, getRoadmapHistory, getRoadmapById, deleteRoadmap, reviewRoadmap, updateRoadmap } = require('../controllers/roadmapController');
const { protect, isVerified } = require('../middleware/authMiddleware');
const { validateRoadmapGeneration, validateMongoId } = require('../validators/roadmapValidator');


router.use(protect, isVerified);
router.post('/generate', validateRoadmapGeneration, generateRoadmap);
router.get('/', getRoadmapHistory);
router.get('/:id', validateMongoId('id'), getRoadmapById);
router.delete('/:id', validateMongoId('id'), deleteRoadmap);
router.post('/review', reviewRoadmap);
router.put('/:id', validateMongoId('id'), updateRoadmap);

module.exports = router;