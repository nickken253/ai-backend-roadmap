const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { ROLES, PROFILE_OPTIONS } = require('../config/constants');

// FIX: Thêm _id vào schema của topic để dễ dàng truy vấn
const resourceSchema = new mongoose.Schema(
  {
    type: { type: String },
    title: { type: String },
    url: { type: String },
  },
  { _id: false }
);

const topicSchema = new mongoose.Schema({
  // _id sẽ được Mongoose tự động tạo
  name: { type: String },
  description: { type: String },
  resources: [resourceSchema],
});

const phaseSchema = new mongoose.Schema({
  // _id sẽ được Mongoose tự động tạo
  phase: { type: Number },
  title: { type: String },
  duration: { type: String },
  topics: [topicSchema],
});

const roadmapResultSchema = new mongoose.Schema(
  {
    reactFlowData: { type: Object },
    roadmap_details: {
      career_goal: { type: String },
      skill_gap_summary: { type: String },
      roadmap: [phaseSchema],
    },
  },
  { _id: false }
);

const roadmapHistorySchema = new mongoose.Schema({
  inputs: { type: Object, required: true },
  result: { type: roadmapResultSchema, required: true },
  created_at: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER
    },
    is_active: {
        type: Boolean,
        default: true
    },
    profile: {
      learning_style: {
        type: String,
        enum: PROFILE_OPTIONS.LEARNING_STYLES,
        default: "practical",
      },
      weekly_goal: {
        type: String,
        enum: PROFILE_OPTIONS.WEEKLY_GOALS,
        default: "serious",
      },
      preferred_languages: {
        type: [String],
        default: ["Vietnamese", "English"],
      },
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    roadmaps_history: [roadmapHistorySchema],
  },
  { timestamps: true }
);

// Mã hóa mật khẩu trước khi lưu
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS));
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Thêm phương thức để so sánh mật khẩu
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
