const User = require('../models/userModel');

const addRoadmap = async (userId, roadmapData) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('Không tìm thấy người dùng.');
    }
    user.roadmaps_history.push(roadmapData);
    await user.save();
    return user.roadmaps_history[user.roadmaps_history.length - 1];
};

const findRoadmapById = async (userId, roadmapId) => {
    const user = await User.findById(userId);
    return user ? user.roadmaps_history.id(roadmapId) : null;
};

const deleteRoadmapById = async (userId, roadmapId) => {
    const user = await User.findById(userId);
    if (user) {
        user.roadmaps_history.pull({ _id: roadmapId });
        return user.save();
    }
};

const updateRoadmapResult = async (userId, roadmapId, newResult) => {
    const user = await User.findById(userId);
    const roadmap = user ? user.roadmaps_history.id(roadmapId) : null;
    if (roadmap) {
        roadmap.result = newResult;
        return user.save();
    }
};

module.exports = {
    addRoadmap,
    findRoadmapById,
    deleteRoadmapById,
    updateRoadmapResult,
};