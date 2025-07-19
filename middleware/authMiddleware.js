const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const { ROLES } = require('../config/constants');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Lấy token từ header
            token = req.headers.authorization.split(' ')[1];

            // Xác thực token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Gắn thông tin user vào request (trừ mật khẩu)
            req.user = await userRepository.findByIdSafe(decoded.id);
            
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === ROLES.ADMIN) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' }); // 403 Forbidden
    }
};

const isVerified = (req, res, next) => {
    if (req.user && req.user.is_verified) {
        next();
    } else {
        res.status(403).json({ message: 'Vui lòng xác thực email của bạn để sử dụng chức năng này.' });
    }
};

module.exports = { protect, admin, isVerified };
