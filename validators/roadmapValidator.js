const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const validateRoadmapGeneration = [
    body('skills').isArray({ min: 1 }).withMessage('Phải cung cấp ít nhất một kỹ năng.'),
    body('skills.*.name').notEmpty().withMessage('Tên kỹ năng không được để trống.'),
    body('skills.*.level').notEmpty().withMessage('Mức độ kỹ năng không được để trống.'),
    body('goal').notEmpty().withMessage('Mục tiêu nghề nghiệp không được để trống.'),
    body('timeline').notEmpty().withMessage('Thời hạn không được để trống.'),
    body('hours').isNumeric().withMessage('Số giờ học phải là một con số.'),
    handleValidationErrors,
];

const validateMongoId = (paramName = 'id') => [
    param(paramName).isMongoId().withMessage(`Tham số ${paramName} không phải là một ID hợp lệ.`),
    handleValidationErrors,
];

module.exports = {
    validateRoadmapGeneration,
    validateMongoId,
};