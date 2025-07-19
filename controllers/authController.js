const userRepository = require("../repositories/userRepository");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/emailService");

// @desc    Đăng ký người dùng mới
// @route   POST /api/v1/auth/register
const registerUser = async (req, res) => {
  const { email, password } = req.body;

  const userExists = await userRepository.findByEmail(email);
  if (userExists) {
    return res.status(400).json({ message: "Email đã tồn tại." });
  }

  const user = await userRepository.create({ email, password });

  if (user) {
    try {
      const verificationToken = user.createVerificationToken();
      await userRepository.save(user);
      const verificationURL = `${req.protocol}://${req.get(
        "host"
      )}/api/v1/auth/verify-email/${verificationToken}`;

      await sendEmail({
        email: user.email,
        subject: "Xác thực tài khoản của bạn",
        template: "verificationEmail", // Tên template
        payload: { verificationURL }, // Dữ liệu để điền vào template
      });
      res.status(201).json({
        message:
          "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
      });
    } catch (err) {
      console.error(err);
      return res.status(201).json({
        message: "Đăng ký thành công, nhưng không thể gửi email xác thực.",
      });
    }
  } else {
    res.status(400).json({ message: "Dữ liệu người dùng không hợp lệ." });
  }
};

// @desc    Đăng nhập
// @route   POST /api/v1/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await userRepository.findByEmail(email);

  if (user && (await user.matchPassword(password))) {
    if (!user.is_active) {
      return res.status(403).json({
        message:
          "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
      });
    }
    res.json({
      message: "Đăng nhập thành công!",
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Email hoặc mật khẩu không chính xác." });
  }
};

const verifyEmail = async (req, res) => {
  const user = await userRepository.findByVerificationToken(req.params.token);
  if (!user) {
    return res
      .status(400)
      .json({ message: "Token không hợp lệ hoặc đã hết hạn." });
  }
  user.is_verified = true;
  user.verification_token = undefined;
  await userRepository.save(user);
  res.status(200).json({ message: "Xác thực email thành công!" });
};

const forgotPassword = async (req, res) => {
  const user = await userRepository.findByEmail(req.body.email);
  if (!user) {
    return res.status(200).json({
      message:
        "Nếu email của bạn tồn tại trong hệ thống, bạn sẽ nhận được link đặt lại mật khẩu.",
    });
  }

  const resetToken = user.createPasswordResetToken();
  await userRepository.save(user);

  try {
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/reset-password/${resetToken}`;
    await sendEmail({
      email: user.email,
      subject: "Yêu cầu đặt lại mật khẩu",
      template: "passwordResetEmail",
      payload: { resetURL },
    });
    res.status(200).json({
      message: "Link đặt lại mật khẩu đã được gửi đến email của bạn.",
    });
  } catch (err) {
    user.password_reset_token = undefined;
    user.password_reset_expires = undefined;
    await userRepository.save(user);
    return res
      .status(500)
      .json({ message: "Lỗi khi gửi email, vui lòng thử lại." });
  }
};

const resetPassword = async (req, res) => {
  const user = await userRepository.findByPasswordResetToken(req.params.token);
  if (!user) {
    return res
      .status(400)
      .json({ message: "Token không hợp lệ hoặc đã hết hạn." });
  }
  user.password = req.body.password;
  user.password_reset_token = undefined;
  user.password_reset_expires = undefined;
  await userRepository.save(user);
  res.status(200).json({ message: "Đặt lại mật khẩu thành công." });
};

// @desc    Lấy thông tin cá nhân
// @route   GET /api/v1/auth/me
const getUserProfile = async (req, res) => {
  // req.user được gắn từ middleware
  res.json({
    id: req.user._id,
    email: req.user.email,
    ...(req.user.role === "admin" && { role: req.user.role }),
    profile: req.user.profile,
    created_at: req.user.created_at,
  });
};

// @desc    Cập nhật profile người dùng
// @route   PUT /api/v1/auth/me/profile
const updateUserProfile = async (req, res) => {
  const user = await userRepository.findById(req.user._id);

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

  // // Kiểm tra dữ liệu đầu vào
  // if (!currentPassword || !newPassword) {
  //   return res
  //     .status(400)
  //     .json({
  //       message: "Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới.",
  //     });
  // }

  // Tìm người dùng trong DB
  const user = await userRepository.findById(req.user._id);

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
  verifyEmail,
  forgotPassword,
  resetPassword,
};
