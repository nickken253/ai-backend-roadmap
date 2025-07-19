const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (options) => {
    // 1. Đọc file template HTML
    const templatePath = path.join(__dirname, 'emailTemplates', `${options.template}.html`);
    let html = fs.readFileSync(templatePath, 'utf-8');

    // 2. Thay thế các placeholder bằng dữ liệu thực tế
    Object.keys(options.payload).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, options.payload[key]);
    });

    const mailOptions = {
        from: `Roadmap AI <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: html,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;