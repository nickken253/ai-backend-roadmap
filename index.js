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
const swaggerUi = require("swagger-ui-express"); // ✨ [MỚI]
const YAML = require("yamljs"); // ✨ [MỚI] Thư viện để đọc file YAML
const path = require("path");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
// ✨ [MỚI] Tải file openapi.yaml
const swaggerDocument = YAML.load(path.join(__dirname, "openapi.yaml"));
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Đã kết nối thành công đến MongoDB!");
    seedAdminUser();
  })
  .catch((err) => console.error("Lỗi kết nối MongoDB:", err));

app.get('/', (req, res) => {
    res.send('Backend Server đang hoạt động! Truy cập /api-docs để xem tài liệu API.');
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
