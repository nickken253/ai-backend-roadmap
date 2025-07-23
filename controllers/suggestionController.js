const { callGeminiAPI } = require("../services/geminiService");
const PromptLog = require("../models/promptLogModel"); // Import model
const { LOG_TYPES, LOG_STATUS } = require("../config/constants");

// @desc    Gợi ý kỹ năng
// @route   GET /api/v1/suggestions/skills
const suggestSkills = async (req, res) => {
  const { goal } = req.query;
  const userId = req.user._id;
  if (!goal) {
    return res
      .status(400)
      .json({ message: "Vui lòng cung cấp mục tiêu nghề nghiệp." });
  }

  const prompt = `List 7 most important technical skills for a "${goal}". Respond with only a JSON array of strings.`;
  const startTime = Date.now();
  try {
    const skills = await callGeminiAPI(prompt);
    const durationMs = Date.now() - startTime;

    await PromptLog.create({
      user_id: userId,
      log_type: LOG_TYPES.SUGGEST_SKILLS,
      prompt_sent: prompt,
      raw_response: JSON.stringify(skills),
      status: LOG_STATUS.SUCCESS,
      duration_ms: durationMs,
    });
    res.json({ skills });
  } catch (error) {
    const durationMs = Date.now() - startTime;
    await PromptLog.create({
      user_id: userId,
      log_type: LOG_TYPES.SUGGEST_SKILLS,
      prompt_sent: prompt,
      status: LOG_STATUS.FAILED,
      error_message: error.message,
      duration_ms: durationMs,
    });
    res
      .status(500)
      .json({ message: "Lỗi khi lấy gợi ý", error: error.message });
  }
};

// @desc    Lấy danh sách mục tiêu nghề nghiệp
// @route   GET /api/v1/suggestions/goals
const getGoals = (req, res) => {
  const goals = [
    "Backend Developer",
    "Frontend Developer",
    "Fullstack Developer",
    "Data Analyst",
    "Data Scientist",
    "DevOps Engineer",
    "Mobile Developer (iOS/Android)",
    "QA Engineer",
  ];
  res.json({ goals });
};

module.exports = { suggestSkills, getGoals };
