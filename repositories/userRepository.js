const User = require("../models/userModel");
const crypto = require('crypto');

const findByEmail = (email) => {
  return User.findOne({ email });
};

const findById = (id) => {
  return User.findById(id); // Trả về cả password để controller có thể dùng
};

const findByIdSafe = (id) => {
  return User.findById(id).select("-password"); // Bỏ password
};

const create = (userData) => {
  return User.create(userData);
};

const save = (userDocument) => {
  return userDocument.save();
};

const findAll = () => {
  return User.find({}).select("-password");
};
const findByVerificationToken = (token) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  return User.findOne({ verification_token: hashedToken });
};

const findByPasswordResetToken = (token) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  return User.findOne({
    password_reset_token: hashedToken,
    password_reset_expires: { $gt: Date.now() },
  });
};
module.exports = {
  findByEmail,
  findById,
  findByIdSafe,
  create,
  save,
  findAll,
  findByVerificationToken,
  findByPasswordResetToken,
};
