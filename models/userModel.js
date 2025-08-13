const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { ROLES, PROFILE_OPTIONS, TOKEN_EXPIRY } = require("../config/constants");

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
    fullname :{
      type: String,
    },
    username: {
      type: String,
      // required: [true, "Username is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      // required: [true, "Password is required"],
      minlength: 6,
      // select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    verification_token: String,
    password_reset_token: String,
    password_reset_expires: Date,
    is_active: {
      type: Boolean,
      default: true,
    },
    googleId: {
      type: String,
    },
    githubId: {
      type: String,
    },
    avatar: {
      type: String,
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
        type: String,
        default: "Vietnamese",
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

userSchema.pre('save', async function (next) {
  // 1. Hash password nếu nó được thay đổi
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10); // Hoặc dùng process.env.BCRYPT_SALT_ROUNDS
    this.password = await bcrypt.hash(this.password, salt);
  }

  // 2. Tạo/Cập nhật avatar từ Gravatar dựa trên email
  if ((this.isNew || this.isModified('email')) && (!this.avatar || this.avatar.includes('gravatar.com'))) {
    const hash = crypto.createHash('md5').update(this.email.toLowerCase().trim()).digest('hex');
    this.avatar = `https://gravatar.com/avatar/${hash}?d=retro&r=g`;
  }

  next();
});

// Thêm phương thức để so sánh mật khẩu
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.createVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.verification_token = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  return token;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.password_reset_token = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.password_reset_expires = Date.now() + TOKEN_EXPIRY.PASSWORD_RESET;
  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
