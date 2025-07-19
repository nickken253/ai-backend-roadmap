const User = require('../models/userModel');

const findByEmail = (email) => {
    return User.findOne({ email });
};

const findById = (id) => {
    return User.findById(id); // Trả về cả password để controller có thể dùng
};

const findByIdSafe = (id) => {
    return User.findById(id).select('-password'); // Bỏ password
};

const create = (userData) => {
    return User.create(userData);
};

const save = (userDocument) => {
    return userDocument.save();
};

const findAll = () => {
    return User.find({}).select('-password');
};

module.exports = {
    findByEmail,
    findById,
    findByIdSafe,
    create,
    save,
    findAll,
};