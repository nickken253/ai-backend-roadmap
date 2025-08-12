const userRepository = require("../repositories/userRepository");
const {generateToken, generateMergeToken} = require("../utils/generateToken");
const sendEmail = require("../utils/emailService");
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/userModel');

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
    // Chỉ tạo token khi đăng ký, không gửi email ngay lập tức.
    user.createVerificationToken(); // Đoạn này có thể sẽ hơi thừa
    await userRepository.save(user);

    res.status(201).json({
      message: "Đăng ký thành công. Bây giờ bạn có thể đăng nhập.",
      userId: user._id,
    });
  } else {
    res.status(400).json({ message: "Dữ liệu người dùng không hợp lệ." });
  }
};

// API chuyên dụng để gửi email xác thực
// @desc    Gửi (lại) email xác thực
// @route   POST /api/v1/auth/send-verification
const sendVerificationEmail = async (req, res) => {
  const user = await userRepository.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "Không tìm thấy người dùng." });
  }

  if (user.is_verified) {
    return res.status(400).json({ message: "Tài khoản này đã được xác thực." });
  }

  try {
    const verificationToken = user.createVerificationToken();
    await userRepository.save(user);

    const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    await sendEmail({
      email: user.email,
      subject: "Xác thực tài khoản của bạn",
      template: "verificationEmail",
      payload: { verificationURL },
    });

    res.status(200).json({
      message: "Email xác thực đã được gửi. Vui lòng kiểm tra hộp thư của bạn.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi gửi email xác thực." });
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
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
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
    fullname: req.user.fullname,
    username: req.user.username,
    email: req.user.email,
    avatar: req.user.avatar,
    googleId: req.user.googleId,
    githubId: req.user.githubId,
    is_verified: req.user.is_verified,
    is_active: req.user.is_active,
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
    user.profile.learning_style = req.body.profile.learning_style || user.profile.learning_style;
    user.profile.weekly_goal = req.body.profile.weekly_goal || user.profile.weekly_goal;
    user.profile.preferred_languages = req.body.profile.preferred_languages || user.profile.preferred_languages;
    user.fullname = req.body.fullname || user.fullname;
    user.googleId = req.body.googleId || user.googleId;
    user.githubId = req.body.githubId || user.githubId;
    // user.avatar = req.body.avatar || user.avatar;
    const updatedUser = await user.save();
    res.json({
      message: "Cập nhật profile thành công.",
      data: {
        fullname: updatedUser.fullname,
        profile: updatedUser.profile
      },
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

/**
 * @desc    Xử lý callback từ Google/GitHub với logic tùy chỉnh
 */
const handleSocialLoginCallback = (req, res, next) => {
  // Xác định provider từ URL
  const provider = req.path.includes('/google/') ? 'google' : 'github';
  
  passport.authenticate(provider, { session: false }, (err, user, info) => {
    if (err) {
      return res.redirect(`${process.env.FRONTEND_URL}/login-failed?error=${err.message}`);
    }

    // Trường hợp 1: Đăng nhập thành công (user mới hoặc đã liên kết)
    if (user) {
      const token = generateToken(user._id);
      return res.redirect(`${process.env.FRONTEND_URL}/login-success?token=${token}`);
    }

    // Trường hợp 2: Xung đột tài khoản, cần xác nhận
    if (info && info.conflict) {
      // Tạo token tạm thời chứa thông tin cần thiết để liên kết
      const mergeToken = generateMergeToken(info);
      // Chuyển hướng đến trang xác nhận của frontend
      return res.redirect(`${process.env.FRONTEND_URL}/confirm-account-link?token=${mergeToken}`);
    }

    // Trường hợp khác
    return res.redirect(`${process.env.FRONTEND_URL}/login-failed?error=unknown`);

  })(req, res, next);
};


/**
 * @desc    Lấy thông tin chi tiết để hiển thị trên trang xác nhận
 * @route   POST /api/v1/auth/link/details
 */
const getLinkConfirmationDetails = asyncHandler(async (req, res) => {
    const { token } = req.body;
    if (!token) throw new Error('Token is required');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const existingUser = await User.findById(decoded.existingUserId).select('fullname avatar');

    if (!existingUser) throw new Error('User not found');

    res.json({
        existingProfile: {
            fullname: existingUser.fullname,
            avatar: existingUser.avatar
        },
        socialProfile: {
            fullname: decoded.socialProfile.fullname,
            avatar: decoded.socialProfile.avatar
        }
    });
});


/**
 * @desc    Hoàn tất việc liên kết tài khoản sau khi người dùng xác nhận
 * @route   POST /api/v1/auth/link/complete
 */
const completeAccountLink = asyncHandler(async (req, res) => {
    const { token, choices } = req.body; // choices: { fullname: 'social', avatar: 'existing' }
    if (!token || !choices) throw new Error('Token and choices are required');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.existingUserId);

    if (!user) throw new Error('User not found');

    // Cập nhật thông tin dựa trên lựa chọn của người dùng
    if (choices.fullname === 'social') {
        user.fullname = decoded.socialProfile.fullname;
    }
    if (choices.avatar === 'social') {
        user.avatar = decoded.socialProfile.avatar;
    }

    // Liên kết tài khoản
    const socialIdField = `${decoded.provider}Id`;
    user[socialIdField] = decoded.socialProfile.id;

    // Đảm bảo username tồn tại
    if (!user.username) {
        const usernameFromEmail = user.email.split('@')[0];
        user.username = `${usernameFromEmail}-${Math.floor(Math.random() * 1000)}`;
    }

    await user.save();

    // Tạo token đăng nhập cuối cùng
    const loginToken = generateToken(user._id);

    res.json({
        message: 'Account linked successfully!',
        token: loginToken,
        user: {
            _id: user._id,
            username: user.username,
            fullname: user.fullname,
            avatar: user.avatar
        }
    });
});

module.exports = {
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
  completeAccountLink,
  getLinkConfirmationDetails,
};
