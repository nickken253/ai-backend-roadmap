const { query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const validateSuggestSkills = [
    query('goal').notEmpty().withMessage('Vui lòng cung cấp mục tiêu nghề nghiệp (goal).'),
    handleValidationErrors,
];

module.exports = {
    validateSuggestSkills,
};