const PromptLog = require("../models/promptLogModel");

const createLog = (logData) => {
  return PromptLog.create(logData);
};

const findAllLogs = (filter) => {
  const limit = parseInt(process.env.PAGINATION_LIMIT) || 100; // Sử dụng biến môi trường
  return PromptLog.find(filter).populate('user_id', 'email').sort({ createdAt: -1 }).limit(parseInt(limit));
};

const findLogById = (id) => {
  return PromptLog.findById(id);
};

module.exports = {
  createLog,
  findAllLogs,
  findLogById,
};
