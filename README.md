# AI Learning Roadmap Generator - Backend

Đây là server backend cho ứng dụng **Gợi ý Lộ trình Học tập Cá nhân hóa**, được xây dựng bằng Node.js, ExpressJS và MongoDB. Ứng dụng sử dụng Google Gemini API để tạo ra các lộ trình học tập thông minh, được cá nhân hóa và cung cấp một bộ công cụ quản trị mạnh mẽ.

## ✨ Tính năng chính

- **Quản lý Người dùng & Xác thực:**
  - Đăng ký, đăng nhập an toàn bằng JWT (JSON Web Token).
  - Xác thực tài khoản qua email (sử dụng Google OAuth2 & Nodemailer).
  - Chức năng quên mật khẩu và thay đổi mật khẩu.
  - Quản lý thông tin cá nhân (profile) để cá nhân hóa gợi ý.
- **Lõi AI thông minh:**
  - Tạo lộ trình học tập chi tiết và được cá nhân hóa bằng Google Gemini API.
  - Tự động tạo biểu đồ flowchart trực quan cho lộ trình (dữ liệu cho React Flow).
  - Tính năng "Đánh giá của AI" cho phép so sánh và nhận xét các thay đổi của người dùng.
  - Gợi ý các kỹ năng liên quan đến mục tiêu nghề nghiệp.
- **Quản lý Lộ trình:**
  - Lưu trữ lịch sử các lộ trình đã tạo cho mỗi người dùng.
  - Cho phép người dùng xem lại, chỉnh sửa và xóa các lộ trình cũ.
- **Hệ thống Quản trị (Admin):**
  - Phân quyền người dùng (user/admin).
  - Quản lý người dùng: xem danh sách, chi tiết, và vô hiệu hóa/kích hoạt tài khoản.
  - Theo dõi và lọc toàn bộ lịch sử giao tiếp với AI (`prompt_logs`).
  - Bảng điều khiển (Dashboard) với các API thống kê chi tiết.
- **Tối ưu hóa & Bảo mật:**
  - Tích hợp Caching bằng Redis để tăng tốc độ phản hồi cho các API ít thay đổi.
  - Áp dụng Rate Limiting để chống lạm dụng API.
  - Kiểm tra tính hợp lệ của dữ liệu đầu vào (Input Validation) cho tất cả các API quan trọng.
- **Tài liệu API tự động:**
  - Tự động tạo trang tài liệu API chuyên nghiệp bằng Swagger UI từ file `openapi.yaml`.

## 🚀 Bắt đầu

### Yêu cầu tiên quyết

- [Node.js](https://nodejs.org/) (phiên bản 16.x trở lên)
- [npm](https://www.npmjs.com/) hoặc [yarn](https://yarnpkg.com/)
- Một instance của [MongoDB](https://www.mongodb.com/) (khuyến khích dùng MongoDB Atlas)
- Một instance của [Redis](https://redis.io/) (khuyến khích dùng Redis Cloud hoặc Upstash)

### Cài đặt

1.  **Clone kho chứa mã nguồn này:**

    ```bash
    git clone [https://your-repository-url.git](https://your-repository-url.git)
    cd ai-backend-roadmap
    ```

2.  **Cài đặt các thư viện cần thiết:**
    ```bash
    npm install
    ```

### Cấu hình

1.  **Tạo file `.env`:**

    - Sao chép file `.env.example` (nếu có) hoặc tạo một file mới tên là `.env` ở thư mục gốc của dự án.

2.  **Điền các biến môi trường:**

    - Mở file `.env` và điền đầy đủ các giá trị theo mẫu dưới đây.

    ```env
    # Cấu hình Server
    PORT=5001
    NODE_ENV=development # Đổi thành 'production' khi deploy

    # Cấu hình Database
    MONGO_URI=your_mongodb_connection_string

    # Cấu hình AI
    GEMINI_API_KEY=your_google_gemini_api_key
    GEMINI_API_URL=[https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent](https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent)

    # Cấu hình Bảo mật & Token
    JWT_SECRET=a_very_long_and_hard_to_guess_secret_key
    JWT_EXPIRES_IN=30d
    BCRYPT_SALT_ROUNDS=10

    # Cấu hình Admin mặc định
    ADMIN_EMAIL=admin@exa.com
    ADMIN_PASSWORD=123456

    # Cấu hình Phân trang & Thống kê
    PAGINATION_LIMIT=100
    STATS_LIMIT=10

    # Cấu hình Gửi mail (Google OAuth2)
    GOOGLE_MAILER_CLIENT_ID=your_google_oauth_client_id
    GOOGLE_MAILER_CLIENT_SECRET=your_google_oauth_client_secret
    GOOGLE_MAILER_REFRESH_TOKEN=your_google_oauth_refresh_token
    ADMIN_EMAIL_ADDRESS=your-gmail-address@gmail.com

    # Cấu hình Redis
    REDIS_HOST=your_redis_host
    REDIS_PORT=your_redis_port
    REDIS_PASSWORD=your_redis_password

    # Cấu hình Frontend
    FRONTEND_URL=http://localhost:3000 # URL của ứng dụng Frontend
    ```

### Chạy ứng dụng

1.  **Chế độ phát triển (Development):**

    - Lệnh này sẽ khởi động server với `nodemon`, tự động khởi động lại khi có thay đổi trong code.

    ```bash
    npm start
    ```

2.  **Chế độ Production:** \* Để chạy ở chế độ production, bạn nên sử dụng một công cụ quản lý tiến trình như `pm2`.
    `bash
    npm install -g pm2
    pm2 start index.js --name "ai-roadmap-backend"
    `
    Sau khi khởi động thành công, server sẽ chạy tại `http://localhost:5001`.

## 📖 Tài liệu API

Dự án sử dụng Swagger UI để tự động tạo một trang tài liệu API tương tác. Sau khi khởi động server, bạn có thể truy cập vào:

[**http://localhost:5001/api-docs**](http://localhost:5001/api-docs)

Tại đây, bạn có thể xem chi tiết tất cả các API endpoints, cấu trúc dữ liệu và thực hiện các lời gọi API để kiểm thử trực tiếp.

## 🗂️ Cấu trúc Dự án

```
/
├── config/         # Chứa các file cấu hình (constants, redis)
├── controllers/    # Chứa logic xử lý cho mỗi route
├── middleware/     # Chứa các middleware (xác thực, cache, rate limit,...)
├── models/         # Chứa các Mongoose Schemas
├── repositories/   # Chứa logic truy cập cơ sở dữ liệu
├── routes/         # Định nghĩa các API endpoints
├── services/       # Chứa logic giao tiếp với dịch vụ bên ngoài (AI)
├── utils/          # Chứa các hàm tiện ích (tạo token, gửi email,...)
├── .env            # File chứa các biến môi trường
├── index.js        # File khởi chạy server chính
└── openapi.yaml    # File đặc tả API

```
