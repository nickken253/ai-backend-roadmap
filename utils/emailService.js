const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs');
const path = require('path');

const sendEmail = async (options) => {
    // 1. Khởi tạo OAuth2 Client với Client ID và Client Secret
    const myOAuth2Client = new OAuth2Client(
        process.env.GOOGLE_MAILER_CLIENT_ID,
        process.env.GOOGLE_MAILER_CLIENT_SECRET
    );

    // 2. Set Refresh Token vào OAuth2Client Credentials
    myOAuth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
    });

    try {
        // 3. Lấy Access Token mới từ Refresh Token
        const myAccessTokenObject = await myOAuth2Client.getAccessToken();
        const myAccessToken = myAccessTokenObject?.token;

        // 4. Tạo transporter của Nodemailer với đầy đủ cấu hình OAuth2
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.ADMIN_EMAIL_ADDRESS,
                clientId: process.env.GOOGLE_MAILER_CLIENT_ID,
                clientSecret: process.env.GOOGLE_MAILER_CLIENT_SECRET,
                refreshToken: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
                accessToken: myAccessToken,
            },
        });

        // 5. Đọc và chuẩn bị nội dung email từ template
        const templatePath = path.join(__dirname, 'emailTemplates', `${options.template}.html`);
        let html = fs.readFileSync(templatePath, 'utf-8');
        Object.keys(options.payload).forEach(key => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            html = html.replace(regex, options.payload[key]);
        });

        // 6. Cấu hình các tùy chọn gửi mail
        const mailOptions = {
            to: options.email,
            subject: options.subject,
            html: html,
        };

        // 7. Gửi email
        await transporter.sendMail(mailOptions);
        console.log('Email đã được gửi thành công!');

    } catch (error) {
        console.error('Lỗi khi gửi email bằng OAuth2:', error);
        // Ném lỗi ra để controller có thể bắt và xử lý
        throw new Error('Không thể gửi email. Vui lòng thử lại sau.');
    }
};

module.exports = sendEmail;