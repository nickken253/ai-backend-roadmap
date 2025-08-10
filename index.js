const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");

// Import các routes
const authRoutes = require("./routes/authRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const suggestionRoutes = require("./routes/suggestionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const seedAdminUser = require("./utils/seeder");
const swaggerUi = require("swagger-ui-express"); 
const YAML = require("yamljs"); 
const path = require("path");
const session = require('express-session');
const passport = require('passport');
// require('./config/db');
require('./config/passport');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET, // Bắt buộc phải có biến này trong file .env
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ✨ [MỚI] Tải file openapi.yaml
const swaggerDocument = YAML.load(path.join(__dirname, "openapi.yaml"));
if (process.env.NODE_ENV === "production") {
  // Nếu đang chạy trên môi trường production (Render)
  swaggerDocument.servers = [
    {
      url: "https://ai-backend-roadmap.onrender.com/api/v1",
      description: "Production Server",
    },
  ];
} else {
  // Nếu đang chạy ở môi trường local
  swaggerDocument.servers = [
    {
      url: `http://localhost:${process.env.PORT || 5000}/api/v1`,
      description: "Development Server",
    },
  ];
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Đã kết nối thành công đến MongoDB!");
    seedAdminUser();
  })
  .catch((err) => console.error("Lỗi kết nối MongoDB:", err));

app.get("/", (req, res) => {
  res.send(
    "Backend Server đang hoạt động! Truy cập /api-docs để xem tài liệu API."
  );
});

// ✨ [MỚI] Route cho trang tài liệu Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Sử dụng các routes với prefix /api/v1
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/roadmaps", roadmapRoutes);
app.use("/api/v1/suggestions", suggestionRoutes);
app.use("/api/v1/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});
