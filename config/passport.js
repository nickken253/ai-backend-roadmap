// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const GitHubStrategy = require('passport-github2').Strategy;
// const User = require('../models/userModel');

// // Cấu hình Google Strategy
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: '/api/v1/auth/google/callback', // Phải khớp với route và cấu hình trên Google Console
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const existingUserByGoogleId = await User.findOne({ googleId: profile.id });
//         if (existingUserByGoogleId) {
//           return done(null, existingUserByGoogleId);
//         }

//         const existingUserByEmail = await User.findOne({ email: profile.emails[0].value });
//         if (existingUserByEmail) {
//           // Liên kết tài khoản
//           existingUserByEmail.googleId = profile.id;
//           existingUserByEmail.avatar = profile.photos[0].value;
//           existingUserByEmail.fullname = existingUserByEmail.fullname || profile.displayName;

//           // FIX: Xử lý trường hợp user cũ trong DB không có username
//           if (!existingUserByEmail.username) {
//             const usernameFromEmail = existingUserByEmail.email.split('@')[0];
//             existingUserByEmail.username = `${usernameFromEmail}${Math.floor(Math.random() * 1000)}`;
//           }

//           await existingUserByEmail.save();
//           return done(null, existingUserByEmail);
//         }

//         // Tạo user mới

//         const usernameFromProfile = profile.displayName ? profile.displayName.replace(/\s/g, '').toLowerCase() : null;
//         const usernameFromEmail = profile.emails[0].value.split('@')[0];
//         const finalUsername = `${usernameFromProfile || usernameFromEmail}${Math.floor(Math.random() * 1000)}`;

//         const newUser = await User.create({
//           googleId: profile.id,
//           username: finalUsername,
//           email: profile.emails[0].value,
//           is_verified: true,
//           avatar: profile.photos[0].value,
//         });
//         return done(null, newUser);
//       } catch (error) {
//         return done(error, false);
//       }
//     }
//   )
// );

// // Cấu hình GitHub Strategy
// passport.use(
//   new GitHubStrategy(
//     {
//       clientID: process.env.GITHUB_CLIENT_ID,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET,
//       callbackURL: '/api/v1/auth/github/callback', // Phải khớp với route và cấu hình trên GitHub
//       scope: ['user:email'],
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         const existingUserByGithubId = await User.findOne({ githubId: profile.id });
//         if (existingUserByGithubId) {
//           return done(null, existingUserByGithubId);
//         }

//         const email = profile.emails && profile.emails[0].value;
//         if (!email) {
//           return done(new Error('Không thể lấy email từ GitHub. Vui lòng đặt email ở chế độ công khai.'), false);
//         }

//         const existingUserByEmail = await User.findOne({ email });
//         if (existingUserByEmail) {
//           // Liên kết tài khoản
//           existingUserByEmail.githubId = profile.id;
//           existingUserByEmail.avatar = profile.photos[0].value;
//           existingUserByEmail.fullname = existingUserByEmail.fullname || profile.displayName || profile.username;

//           if (!existingUserByEmail.username) {
//             // Ưu tiên dùng username từ GitHub
//             const usernameFromGithub = profile.username;
//             if (usernameFromGithub) {
//                 // Thêm hậu tố ngẫu nhiên để tránh trùng lặp
//                 existingUserByEmail.username = `${usernameFromGithub}${Math.floor(Math.random() * 1000)}`;
//             } else {
//                 // Fallback về email nếu GitHub không trả về username
//                 const usernameFromEmail = existingUserByEmail.email.split('@')[0];
//                 existingUserByEmail.username = `${usernameFromEmail}${Math.floor(Math.random() * 1000)}`;
//             }
//           }

//           await existingUserByEmail.save();
//           return done(null, existingUserByEmail);
//         }

//         const usernameFromProfile = profile.username;
//         const usernameFromEmail = email.split('@')[0];
//         const finalUsername = `${usernameFromProfile || usernameFromEmail}${Math.floor(Math.random() * 1000)}`;

//         const newUser = await User.create({
//           githubId: profile.id,
//           username: finalUsername,
//           email: email,
//           is_verified: true,
//           avatar: profile.photos[0].value,
//         });
//         return done(null, newUser);
//       } catch (error) {
//         return done(error, false);
//       }
//     }
//   )
// );

// // Passport cần 2 hàm này để quản lý session, dù chúng ta dùng JWT
// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (error) {
//     done(error, false);
//   }
// });

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/userModel");

const googleCallbackURL =
  process.env.NODE_ENV === "production"
    ? `${process.env.SERVER_URL}/api/v1/auth/google/callback`
    : "/api/v1/auth/google/callback";

const githubCallbackURL =
  process.env.NODE_ENV === "production"
    ? `${process.env.SERVER_URL}/api/v1/auth/github/callback`
    : "/api/v1/auth/github/callback";

// --- HÀM TRỢ GIÚP ---
const handleSocialLogin = async (provider, profile, done) => {
  try {
    const socialIdField = `${provider}Id`; // 'googleId' or 'githubId'
    const email = profile.emails && profile.emails[0].value;

    if (!email) {
      return done(new Error(`Không thể lấy email từ ${provider}.`), false);
    }

    // 1. Tìm user bằng social ID (đã từng đăng nhập bằng MXH này)
    let user = await User.findOne({ [socialIdField]: profile.id });
    if (user) {
      return done(null, user);
    }

    // 2. Tìm user bằng email (đã có tài khoản bằng email hoặc MXH khác)
    user = await User.findOne({ email });
    if (user) {
      // TÀI KHOẢN ĐÃ TỒN TẠI -> GỬI TÍN HIỆU XUNG ĐỘT
      // Thay vì tự động cập nhật, chúng ta gửi thông tin về controller để xử lý
      const conflictData = {
        conflict: true,
        provider,
        existingUserId: user._id.toString(),
        socialProfile: {
          id: profile.id,
          fullname: profile.displayName || profile.username,
          avatar: profile.photos && profile.photos[0].value,
        },
      };
      // user là `false` vì quá trình đăng nhập chưa hoàn tất
      return done(null, false, conflictData);
    }

    // 3. Tạo user mới hoàn toàn
    const usernameFromProfile =
      profile.username ||
      (profile.displayName
        ? profile.displayName.replace(/\s/g, "").toLowerCase()
        : null);
    const usernameFromEmail = email.split("@")[0];
    const finalUsername = `${
      usernameFromProfile || usernameFromEmail
    }-${Math.floor(Math.random() * 1000)}`;

    const newUser = await User.create({
      [socialIdField]: profile.id,
      username: finalUsername,
      fullname: profile.displayName || profile.username,
      email: email,
      is_verified: true,
      avatar: profile.photos && profile.photos[0].value,
      profile: {
        preferred_languages: "Vietnamese",
      },
    });
    return done(null, newUser);
  } catch (error) {
    return done(error, false);
  }
};

// --- STRATEGIES ---
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: googleCallbackURL,
    },
    (accessToken, refreshToken, profile, done) =>
      handleSocialLogin("google", profile, done)
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: githubCallbackURL,
      scope: ["user:email"],
    },
    (accessToken, refreshToken, profile, done) =>
      handleSocialLogin("github", profile, done)
  )
);

// Serialize & Deserialize
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, false);
  }
});
