const User = require("../models/userModel");
const generateToken = require("../utils/generateToken");

// @desc    Đăng ký người dùng mới
// @route   POST /api/v1/auth/register
const registerUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Vui lòng cung cấp email và mật khẩu." });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "Email đã tồn tại." });
  }

  const user = await User.create({ email, password });
  if (user) {
    res.status(201).json({
      message: "Đăng ký thành công!",
      userId: user._id,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: "Dữ liệu người dùng không hợp lệ." });
  }
};

// @desc    Đăng nhập
// @route   POST /api/v1/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      message: "Đăng nhập thành công!",
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Email hoặc mật khẩu không chính xác." });
  }
};

// @desc    Lấy thông tin cá nhân
// @route   GET /api/v1/auth/me
const getUserProfile = async (req, res) => {
  // req.user được gắn từ middleware
  res.json({
    id: req.user._id,
    email: req.user.email,
    profile: req.user.profile,
    created_at: req.user.created_at,
  });
};

// @desc    Cập nhật profile người dùng
// @route   PUT /api/v1/auth/me/profile
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.profile.learning_style =
      req.body.learning_style || user.profile.learning_style;
    user.profile.weekly_goal = req.body.weekly_goal || user.profile.weekly_goal;
    user.profile.preferred_languages =
      req.body.preferred_languages || user.profile.preferred_languages;

    const updatedUser = await user.save();
    res.json({
      message: "Cập nhật profile thành công.",
      profile: updatedUser.profile,
    });
  } else {
    res.status(404).json({ message: "Không tìm thấy người dùng." });
  }
};

// @desc    Thay đổi mật khẩu người dùng
// @route   PUT /api/v1/auth/me/password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({
        message: "Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới.",
      });
  }

  // Tìm người dùng trong DB
  const user = await User.findById(req.user._id);

  // Kiểm tra xem người dùng có tồn tại và mật khẩu hiện tại có khớp không
  if (user && (await user.matchPassword(currentPassword))) {
    // Cập nhật mật khẩu mới (hàm pre-save trong model sẽ tự động hash)
    user.password = newPassword;
    await user.save();
    res.json({ message: "Đổi mật khẩu thành công." });
  } else {
    res.status(401).json({ message: "Mật khẩu hiện tại không chính xác." });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
};
