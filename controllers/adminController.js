const promptLogRepository = require("../repositories/promptLogRepository");
const userRepository = require("../repositories/userRepository");
const statsRepository = require("../repositories/statsRepository");
const { ROLES } = require('../config/constants');

// @desc    Lấy tất cả các log prompt
// @route   GET /api/v1/admin/logs
const getPromptLogs = async (req, res) => {
  try {
    const { status, logType, userId } = req.query;
    const filter = {};
    if (status) filter.status = status.toUpperCase();
    if (logType) filter.log_type = logType;
    if (userId) filter.user_id = userId;

    const logs = await promptLogRepository.findAllLogs(filter);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy logs." });
  }
};

const getPromptLogById = async (req, res) => {
    try {
        const log = await promptLogRepository.findLogById(req.params.id);
        if (log) {
            res.json(log);
        } else {
            res.status(404).json({ message: "Không tìm thấy log." });
        }
    } catch (error) {
        res.status(500).json({ message: "Lỗi server." });
    }
};

// @desc    Lấy danh sách người dùng
// @route   GET /api/v1/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await userRepository.findAll();
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi server khi lấy danh sách người dùng." });
  }
};

const getUserById = async (req, res) => {
    try {
        const user = await userRepository.findByIdSafe(req.params.id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: "Không tìm thấy người dùng." });
        }
    } catch (error) {
        res.status(500).json({ message: "Lỗi server." });
    }
};

// const updateUserStatus = async (req, res) => {
//     try {
//         const user = await userRepository.findById(req.params.id);
//         if (user) {
//             if (typeof req.body.is_active !== 'boolean') {
//                 return res.status(400).json({ message: "Giá trị is_active phải là true hoặc false." });
//             }
//             user.is_active = req.body.is_active;
//             await userRepository.save(user);
//             res.json({ message: `Đã cập nhật trạng thái người dùng thành ${user.is_active ? 'hoạt động' : 'bị khóa'}.` });
//         } else {
//             res.status(404).json({ message: "Không tìm thấy người dùng." });
//         }
//     } catch (error) {
//         res.status(500).json({ message: "Lỗi server." });
//     }
// };

const updateUserStatus = async (req, res) => {
    try {
        if (typeof req.body.is_active !== 'boolean') {
            return res.status(400).json({ message: "Giá trị is_active phải là true hoặc false." });
        }

        const updatedUser = await userRepository.updateById(req.params.id, { is_active: req.body.is_active });

        if (updatedUser) {
            res.json({ message: `Đã cập nhật trạng thái người dùng thành ${updatedUser.is_active ? 'hoạt động' : 'bị khóa'}.` });
        } else {
            res.status(404).json({ message: "Không tìm thấy người dùng." });
        }
    } catch (error) {
        // Thêm log lỗi để dễ debug hơn
        console.error("Lỗi khi cập nhật trạng thái người dùng:", error);
        res.status(500).json({ message: "Lỗi server." });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const user = await userRepository.findById(req.params.id);
        if (user) {
            const newRole = req.body.role;
            if (!Object.values(ROLES).includes(newRole)) {
                return res.status(400).json({ message: "Vai trò không hợp lệ." });
            }
            user.role = newRole;
            await userRepository.save(user);
            res.json({ message: `Đã cập nhật vai trò người dùng thành '${newRole}'.` });
        } else {
            res.status(404).json({ message: "Không tìm thấy người dùng." });
        }
    } catch (error) {
        res.status(500).json({ message: "Lỗi server." });
    }
};

// --- Thống kê ---
const getDashboardStats = async (req, res) => {
    try {
        const stats = await statsRepository.getDashboardStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thống kê dashboard.', error: error.message });
    }
};

const getPopularGoals = async (req, res) => {
    try {
        const stats = await statsRepository.getPopularGoalsStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thống kê mục tiêu.', error: error.message });
    }
};

const getStudyTimeStats = async (req, res) => {
    try {
        const stats = await statsRepository.getStudyTimeStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thống kê thời gian học.', error: error.message });
    }
};

const getPopularSkills = async (req, res) => {
    try {
        const stats = await statsRepository.getPopularSkillsStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thống kê kỹ năng.', error: error.message });
    }
};


module.exports = {
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
};
