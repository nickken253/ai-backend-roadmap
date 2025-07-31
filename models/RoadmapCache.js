// models/RoadmapCache.js
const mongoose = require('mongoose');

const roadmapCacheSchema = new mongoose.Schema({
  _id: String, // cacheKey (SHA256 hash)
  inputs: Object, // Thông tin đầu vào chuẩn hóa
  roadmap_result: Object, // Kết quả trả về từ AI
  hit_count: { type: Number, default: 1 },
  last_accessed: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('RoadmapCache', roadmapCacheSchema);
