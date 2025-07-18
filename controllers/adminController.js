const PromptLog = require('../models/promptLogModel');
const User = require('../models/userModel');

// @desc    Lấy tất cả các log prompt
// @route   GET /api/v1/admin/logs
const getPromptLogs = async (req, res) => {
    try {
        // Lấy tất cả log và sắp xếp theo ngày tạo mới nhất
        const limit = parseInt(process.env.PAGINATION_LIMIT) || 100; // Sử dụng biến môi trường
        const logs = await PromptLog.find({}).sort({ createdAt: -1 }).limit(limit);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi lấy logs." });
    }
};

// @desc    Lấy danh sách người dùng
// @route   GET /api/v1/admin/users
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi lấy danh sách người dùng." });
    }
};

module.exports = { getPromptLogs, getUsers };