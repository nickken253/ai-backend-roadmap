const express = require("express");
const passport = require("passport");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  verifyEmail,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  handleSocialLoginCallback,
  getLinkConfirmationDetails,
  completeAccountLink,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
} = require("../validators/authValidator");

router.post("/register", validateRegistration, registerUser);
router.post("/login", validateLogin, loginUser);
router.get("/me", protect, getUserProfile);
router.put("/me/profile", protect, validateProfileUpdate, updateUserProfile);
router.put("/me/password", protect, validatePasswordChange, changePassword);
router.get("/verify-email/:token", verifyEmail);
router.put("/reset-password/:token", resetPassword);
router.post("/forgot-password", forgotPassword);
router.post("/send-verification", protect, sendVerificationEmail);

// === SOCIAL LOGIN ROUTES ===

// Sử dụng một hàm callback tùy chỉnh để xử lý các trường hợp khác nhau
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', handleSocialLoginCallback);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', handleSocialLoginCallback);


// === ACCOUNT LINKING ROUTES (MỚI) ===
// Endpoint để frontend lấy thông tin so sánh (tên, avatar)
router.post('/link/details', getLinkConfirmationDetails);

// Endpoint để frontend gửi lựa chọn của người dùng và hoàn tất liên kết
router.post('/link/complete', completeAccountLink);

module.exports = router;
