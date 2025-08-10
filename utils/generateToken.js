const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d', // Token hết hạn sau 30 ngày
    });
};
const generateLoginToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

// Token tạm thời, chỉ dùng để xác nhận liên kết tài khoản
const generateMergeToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '10m' }); // Hết hạn sau 10 phút
};

module.exports = {generateToken, generateLoginToken, generateMergeToken};