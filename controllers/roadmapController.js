const roadmapRepository = require("../repositories/roadmapRepository");
const promptLogRepository = require("../repositories/promptLogRepository");
const { callGeminiAPI } = require("../services/geminiService");
const { LOG_TYPES, LOG_STATUS } = require("../config/constants");
const RoadmapCache = require("../models/RoadmapCache");
const { normalizeInput, createCacheKey } = require("../utils/cacheKey");

// @desc    Tạo lộ trình mới
// @route   POST /api/v1/roadmaps/generate
const generateRoadmap = async (req, res) => {
  const userInput = req.body;
  const userId = req.user._id;
  const user = req.user; // Lấy thông tin user từ middleware

  const skillsText = userInput.skills
    .map((s) => `${s.name} (${s.level})`)
    .join(", ");
  const prompt = `
        **ROLE:** You are an expert Career Advisor and System Architect.

        **TASK:** Create a detailed learning roadmap and a corresponding React Flow data structure.

        **USER CONTEXT:**
        - Current Skills: ${skillsText}
        - Career Goal: ${userInput.goal}
        - Desired Timeline: ${userInput.timeline}
        - Weekly Study Time: ${userInput.hours} hours
        - User Profile: Learning Style is '${user.profile.learning_style}', Weekly Goal is '${user.profile.weekly_goal}'.

        **INSTRUCTIONS:**
        1.  **Analyze & Plan:** Based on the user's context, create a logical, phased learning roadmap.
        2.  **Generate Roadmap Details:** For each phase, provide a title, duration, and a list of specific topics. For each topic, provide a name, a short description, and 2-3 learning resources tailored to the user's learning style (e.g., suggest video courses for 'visual' learners, interactive platforms for 'practical' learners).
        3.  **Generate React Flow Data:** Create a 'reactFlowData' object. It must contain:
            - An array of 'nodes'. Each node represents a phase and must have an 'id' (e.g., "phase1"), a 'type' (use 'input' for the first node, 'default' for others), a 'position' (arrange them logically, e.g., x: 250, y: 5 + index * 120), and a 'data' object with a 'label' (e.g., "Phase 1: Node.js") and a 'description' (e.g., "A back-end JavaScript runtime environment that runs on the V8 engine and executes JavaScript code outside a web browser").
            - An array of 'edges' to connect the nodes sequentially. Each edge must have an 'id' (e.g., "e1-2"), a 'source' id, a 'target' id, and can have 'type: 'smoothstep''.
        4.  **Final Output:** Combine everything into a single, valid JSON object following the specified schema. DO NOT include any markdown, comments, or any text outside of the final JSON object. AND content will display in ${user.profile.preferred_languages || 'Vietnamese'}.

        **EXAMPLE JSON SCHEMA (Follow this structure strictly):**
        \`\`\`json
        {
          "reactFlowData": {
            "nodes": [
              { "id": "phase1", "type": "input", "position": { "x": 250, "y": 5 }, "data": { "label": "Phase 1: Title", "description": "A paragraph providing a detailed description of the content to be included and the tasks to be carried out in this section, with a length of about 300 words."  } }
            ],
            "edges": []
          },
          "roadmap_details": {
            "career_goal": "User's Goal",
            "skill_gap_summary": "A brief summary.",
            "roadmap": [
              {
                "phase": 1,
                "title": "Phase 1: Title",
                "duration": "4 Weeks",
                "topics": [
                  {
                    "name": "Topic Name",
                    "description": "Topic detailed description.",
                    "resources": [
                      { "type": "Course", "title": "Resource Title", "url": "http://example.com" }
                    ]
                  }
                ]
              }
            ]
          }
        }
        \`\`\`
    `;

  // 1. Chuẩn hóa đầu vào và tạo cacheKey
  const normalizedInput = normalizeInput(userInput);
  const cacheKey = createCacheKey(normalizedInput);

  // 2. Kiểm tra cache
  let cacheDoc = await RoadmapCache.findById(cacheKey);
  if (cacheDoc) {
    // 3a. Nếu Cache Hit: update metadata, trả về kết quả
    cacheDoc.hit_count += 1;
    cacheDoc.last_accessed = new Date();
    await cacheDoc.save();

    // Lưu lịch sử cho user (nếu muốn)
    const newRoadmapData = {
      inputs: userInput,
      result: cacheDoc.roadmap_result,
    };
    const savedRoadmap = await roadmapRepository.addRoadmap(
      user._id,
      newRoadmapData
    );

    // Trả về roadmap vừa lưu đầy đủ _id, tránh bị undefined
    return res.status(201).json(savedRoadmap);
  }

  const startTime = Date.now();
  try {
    const result = await callGeminiAPI(prompt);
    const durationMs = Date.now() - startTime;

    // const dbUser = await User.findById(user._id);
    // const newRoadmap = {
    //   // _id sẽ được Mongoose tự động tạo khi push
    //   inputs: userInput,
    //   result: result,
    // };
    // dbUser.roadmaps_history.push(newRoadmap);
    const newRoadmapData = { inputs: userInput, result: result };
    const savedRoadmap = await roadmapRepository.addRoadmap(
      user._id,
      newRoadmapData
    );
    // await dbUser.save();

    // Lấy lại lộ trình vừa được tạo để có _id
    // const savedRoadmap =
    //   dbUser.roadmaps_history[dbUser.roadmaps_history.length - 1];

    await promptLogRepository.createLog({
      user_id: user._id,
      log_type: LOG_TYPES.GENERATE,
      roadmap_id: savedRoadmap._id,
      prompt_sent: prompt,
      raw_response: JSON.stringify(result),
      status: LOG_STATUS.SUCCESS,
      duration_ms: durationMs,
    });

    await RoadmapCache.create({
      _id: cacheKey,
      inputs: normalizedInput,
      roadmap_result: result,
    });

    // FIX: Trả về toàn bộ object lộ trình vừa lưu, bao gồm cả _id
    res.status(201).json(savedRoadmap);
  } catch (error) {
    const durationMs = Date.now() - startTime;
    await promptLogRepository.createLog({
      user_id: userId,
      log_type: LOG_TYPES.GENERATE,
      prompt_sent: prompt,
      status: LOG_STATUS.FAILED,
      error_message: error.message,
      duration_ms: durationMs,
    });
    res
      .status(500)
      .json({ message: "Lỗi khi tạo lộ trình", error: error.message });
  }
};

// @desc    Xem lịch sử lộ trình
// @route   GET /api/v1/roadmaps
const getRoadmapHistory = async (req, res) => {
  const user = await req.user;
  const history = user.roadmaps_history
    .map((r) => ({
      roadmap_id: r._id,
      created_at: r.created_at,
      career_goal: r.result.roadmap_details.career_goal,
    }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json(history);
};

// @desc    Xem chi tiết một lộ trình
// @route   GET /api/v1/roadmaps/:id
const getRoadmapById = async (req, res) => {
  const user = await req.user;
  const roadmap = user.roadmaps_history.id(req.params.id);

  if (roadmap) {
    res.json(roadmap.result);
  } else {
    res.status(404).json({ message: "Không tìm thấy lộ trình." });
  }
};

// @desc    Xóa một lộ trình
// @route   DELETE /api/v1/roadmaps/:id
const deleteRoadmap = async (req, res) => {
  const user = await req.user;
  user.roadmaps_history.pull({ _id: req.params.id });
  await user.save();
  res.json({ message: "Đã xóa lộ trình." });
};

// @desc    Nhờ AI đánh giá sự thay đổi của lộ trình
// @route   POST /api/v1/roadmaps/review
const reviewRoadmap = async (req, res) => {
  const { original_roadmap, modified_roadmap } = req.body;
  const userId = req.user._id;

  if (!original_roadmap || !modified_roadmap) {
    return res.status(400).json({
      message: "Vui lòng cung cấp lộ trình gốc và lộ trình đã chỉnh sửa.",
    });
  }

  // Chuyển object thành chuỗi JSON để đưa vào prompt
  const originalJson = JSON.stringify(original_roadmap, null, 2);
  const modifiedJson = JSON.stringify(modified_roadmap, null, 2);

  const prompt = `
        **ROLE:** You are an expert Career Advisor providing structured feedback.

        **TASK:** Compare the 'original_roadmap' with the 'modified_roadmap'. Identify the changes and provide constructive feedback for each significant change.

        **Original Roadmap:**
        ${originalJson}

        **User's Modified Roadmap:**
        ${modifiedJson}

        **INSTRUCTION:**
        1.  Analyze the differences between the two roadmaps.
        2.  Provide an 'overall_comment' summarizing the quality of the user's edits.
        3.  Provide an array of 'analysis_points'. Each object in this array should represent a single topic or phase that was changed.
        4.  Inside each 'analysis_point', provide a 'topic_name' and an array of 'changes'. Each object in the 'changes' array represents a specific piece of feedback (positive, warning, or suggestion) for that topic. This allows grouping multiple feedback points for the same topic.
        5.  Respond with ONLY a valid JSON object following the schema. Do not add any text outside the JSON object. AND content will display in ${user.profile.preferred_languages || 'Vietnamese'}.

        **JSON SCHEMA (Strictly follow this):**
        \`\`\`json
        {
          "feedback": {
            "overall_comment": "A brief, overall summary of the changes.",
            "analysis_points": [
              {
                "topic_name": "Name of the Phase or Topic that was changed",
                "changes": [
                  {
                    "type": "warning",
                    "comment": "Specific comment about one aspect of the change, for example, a warning."
                  },
                  {
                    "type": "suggestion",
                    "comment": "Another comment for the same topic, for example, a suggestion."
                  }
                ]
              }
            ]
          }
        }
        \`\`\`
    `;
  const startTime = Date.now();
  try {
    const result = await callGeminiAPI(prompt);
    const durationMs = Date.now() - startTime;

    await promptLogRepository.createLog({
      user_id: userId,
      log_type: LOG_TYPES.REVIEW, // Phân loại log
      prompt_sent: prompt,
      raw_response: JSON.stringify(result),
      status: LOG_STATUS.SUCCESS,
      duration_ms: durationMs,
    });

    res.json(result);
  } catch (error) {
    const durationMs = Date.now() - startTime;
    await promptLogRepository.createLog({
      user_id: userId,
      log_type: LOG_TYPES.REVIEW,
      prompt_sent: prompt,
      status: LOG_STATUS.FAILED,
      error_message: error.message,
      duration_ms: durationMs,
    });
    res
      .status(500)
      .json({ message: "Lỗi khi lấy đánh giá từ AI", error: error.message });
  }
};

// @desc    Lưu lại toàn bộ lộ trình đã chỉnh sửa
// @route   PUT /api/v1/roadmaps/:id
const updateRoadmap = async (req, res) => {
  const { id } = req.params;
  const updatedResult = req.body; // Toàn bộ object result mới
  const user = await req.user;

  const roadmap = user.roadmaps_history.id(id);
  if (!roadmap) {
    return res.status(404).json({ message: "Không tìm thấy lộ trình." });
  }

  roadmap.result = updatedResult;

  await user.save();
  res.json({ message: "Đã lưu lại lộ trình thành công." });
};

module.exports = {
  generateRoadmap,
  getRoadmapHistory,
  getRoadmapById,
  deleteRoadmap,
  reviewRoadmap,
  updateRoadmap,
};
