const express = require('express');
const router = express.Router();
const { 
    generateRoadmap, 
    getRoadmapHistory, 
    getRoadmapById, 
    deleteRoadmap,
    reviewRoadmap, // ✨ [MỚI]
    updateRoadmap  // ✨ [MỚI]
} = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateRoadmap);

router.get('/', protect, getRoadmapHistory);

router.get('/:id', protect, getRoadmapById);

router.delete('/:id', protect, deleteRoadmap);

router.post('/review', protect, reviewRoadmap);

router.put('/:id', protect, updateRoadmap);

module.exports = router;