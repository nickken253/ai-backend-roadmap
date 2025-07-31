// utils/cacheKey.js
const crypto = require('crypto');

// Hàm chuẩn hóa input (sort skills theo tên để nhất quán)
function normalizeInput(input) {
  return {
    ...input,
    skills: Array.isArray(input.skills)
      ? [...input.skills].sort((a, b) => a.name.localeCompare(b.name))
      : []
  };
}

// Hàm tạo cacheKey bằng SHA256 từ JSON của dữ liệu chuẩn hóa
function createCacheKey(normalizedInput) {
  const jsonStr = JSON.stringify(normalizedInput);
  return crypto.createHash('sha256').update(jsonStr).digest('hex');
}

// xuất các hàm để dùng ở nơi khác
module.exports = {
  normalizeInput,
  createCacheKey,
};
