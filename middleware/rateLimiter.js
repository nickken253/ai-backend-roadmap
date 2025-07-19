const rateLimit = require('express-rate-limit');
const { RATE_LIMITER } = require('../config/constants');

const authLimiter = rateLimit({
	windowMs: RATE_LIMITER.WINDOW_MS,
	max: RATE_LIMITER.MAX_REQUESTS,
	standardHeaders: true,
	legacyHeaders: false,
    message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút.'
});

module.exports = { authLimiter };