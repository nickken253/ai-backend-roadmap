const { body, validationResult } = require('express-validator');
const { PROFILE_OPTIONS } = require('../config/constants');

// Middleware chung để xử lý lỗi validation
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const validateRegistration = [
    body('email').isEmail().withMessage('Email không hợp lệ.'),
    body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự.'),
    handleValidationErrors,
];

const validateLogin = [
    body('email').isEmail().withMessage('Email không hợp lệ.'),
    body('password').notEmpty().withMessage('Mật khẩu không được để trống.'),
    handleValidationErrors,
];

const validateProfileUpdate = [
    body('learning_style').optional().isIn(PROFILE_OPTIONS.LEARNING_STYLES).withMessage('Phong cách học không hợp lệ.'),
    body('weekly_goal').optional().isIn(PROFILE_OPTIONS.WEEKLY_GOALS).withMessage('Mục tiêu tuần không hợp lệ.'),
    handleValidationErrors,
];

const validatePasswordChange = [
    body('currentPassword').notEmpty().withMessage('Mật khẩu hiện tại không được để trống.'),
    body('newPassword').isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự.'),
    handleValidationErrors,
];

module.exports = {
    validateRegistration,
    validateLogin,
    validateProfileUpdate,
    validatePasswordChange,
};