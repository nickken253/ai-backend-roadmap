const User = require('../models/userModel');
const dotenv = require('dotenv');

// Đảm bảo các biến môi trường được tải
dotenv.config();

const seedAdminUser = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword123';

        const adminExists = await User.findOne({ email: adminEmail });

        if (!adminExists) {
            await User.create({
                email: adminEmail,
                password: adminPassword,
                role: 'admin' // Gán vai trò là admin
            });
            console.log(`Tài khoản admin mặc định đã được tạo: ${adminEmail}`);
        }
    } catch (error) {
        console.error('Lỗi khi tạo tài khoản admin mặc định:', error);
    }
};

module.exports = seedAdminUser;