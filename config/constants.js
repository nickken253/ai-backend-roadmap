const ROLES = Object.freeze({
  ADMIN: "admin",
  USER: "user",
});

const LOG_TYPES = Object.freeze({
  GENERATE: "generate",
  REVIEW: "review",
  SUGGEST_SKILLS: "suggest_skills",
});

const LOG_STATUS = Object.freeze({
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
});

const PROFILE_OPTIONS = Object.freeze({
  LEARNING_STYLES: ["visual", "practical", "reading", "auditory"],
  WEEKLY_GOALS: ["casual", "serious", "intensive"],
});

const SUGGESTION_GOALS = Object.freeze([
  "Backend Developer",
  "Frontend Developer",
  "Fullstack Developer",
  "Data Analyst",
  "Data Scientist",
  "DevOps Engineer",
  "Mobile Developer (iOS/Android)",
  "QA Engineer",
]);
const PASSWORD_MIN_LENGTH = 6;

// THỜI GIAN MÃ XÁC THỰC QUA MAIL
const ONE_MINUTE_IN_MS = 60 * 1000;
const ONE_HOUR_IN_SECONDS = 3600;

const RATE_LIMITER = Object.freeze({
  WINDOW_MS: 15 * ONE_MINUTE_IN_MS, // 15 phút
  MAX_REQUESTS: 10,
});

const TOKEN_EXPIRY = Object.freeze({
  PASSWORD_RESET: 10 * ONE_MINUTE_IN_MS, // 10 phút
});

const CACHE_DURATIONS = Object.freeze({
  ONE_DAY: ONE_HOUR_IN_SECONDS * 24,
  ONE_HOUR: ONE_HOUR_IN_SECONDS,
  TEN_MINUTES: 600,
});

module.exports = {
  ROLES,
  LOG_TYPES,
  LOG_STATUS,
  PROFILE_OPTIONS,
  SUGGESTION_GOALS,
  PASSWORD_MIN_LENGTH,
  RATE_LIMITER,
  TOKEN_EXPIRY,
  CACHE_DURATIONS,
};
