const ROLES = Object.freeze({
  ADMIN: "admin",
  USER: "user",
});

const LOG_TYPES = Object.freeze({
  GENERATE: "generate",
  REVIEW: "review",
  SUGGEST_SKILLS: "suggest_skills",
});

const LOG_STATUS = Object.freeze({
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
});

const PROFILE_OPTIONS = Object.freeze({
  LEARNING_STYLES: ["visual", "practical", "reading", "auditory"],
  WEEKLY_GOALS: ["casual", "serious", "intensive"],
});

const SUGGESTION_GOALS = [
  // Lĩnh vực Công nghệ thông tin
  "Backend Developer (Node.js, REST API)",
  "Frontend Developer (React, Responsive Web)",
  "Fullstack Developer (MERN/MEVN Stack)",
  "Data Analyst (Phân tích dữ liệu bằng Python)",
  "Data Scientist (Machine Learning, Dự báo dữ liệu)",
  "DevOps Engineer (CI/CD Pipelines, Automation)",
  "Mobile Developer (Flutter, Swift, Android Studio)",
  "QA Automation Engineer (Kiểm thử tự động với Selenium)",
  "UI/UX Designer (Wireframe, Prototype, Figma)",
  "Cloud Solutions Architect (AWS, GCP, Azure)",
  "Cybersecurity Analyst (Kiểm thử xâm nhập, SOC Analyst)",
  "Product Manager (Agile, Phát triển sản phẩm số)",
  "Game Developer (Unity, Unreal, Mobile Games)",
  "AI/ML Engineer (Natural Language Processing, Computer Vision)",
  "Business Analyst (Agile & Scrum, Chuyển đổi số)",
  "Database Administrator (Quản trị Oracle, MySQL)",
  "Embedded Systems Engineer (IoT, Firmware Programming)",
  "System Administrator (Linux, Windows Server)",
  "Technical Writer (Viết tài liệu kỹ thuật sản phẩm)",
  "Blockchain Developer (Smart Contracts, Dapps)"
  
  // Khối Kinh tế - Tài chính
  ,"Investment Analyst (Phân tích chứng khoán, Quản lý danh mục đầu tư)"
  ,"Accountant (Kế toán trưởng, Chuẩn bị báo cáo tài chính)"
  ,"Auditing Specialist (Kiểm toán nội bộ, External Audit)"
  ,"Financial Planner (Tư vấn tài chính cá nhân, Lập kế hoạch đầu tư)"
  ,"Banking Relationship Manager (Quản lý khách hàng tổ chức)"
  ,"Tax Consultant (Tư vấn thuế doanh nghiệp)"

  // Marketing - Quảng cáo
  ,"Digital Marketing Strategist (SEO, Google Ads, Social Media)"
  ,"Content Creator (Video, Blog, Social Platforms)"
  ,"Brand Manager (Quản trị thương hiệu)"
  ,"Performance Marketing Specialist (Quảng cáo Facebook/Google)"
  ,"Event Planner (Tổ chức sự kiện, Livestream)"
  ,"Market Research Analyst (Phân tích thị trường, Nghiên cứu người tiêu dùng)"

  // Khối Giáo dục - Đào tạo
  ,"STEM Teacher (Giảng dạy Khoa học/Toán/Tin học)"
  ,"Curriculum Developer (Thiết kế chương trình học trực tuyến)"
  ,"Educational Consultant (Tư vấn du học, học bổng quốc tế)"
  ,"E-learning Content Developer (Phát triển nội dung học số)"
  ,"Language Tutor (Dạy tiếng Anh, tiếng Nhật, online/offline)"
  
  // Y tế - Sức khỏe
  ,"Clinical Research Coordinator (Điều phối nghiên cứu lâm sàng)"
  ,"Nurse Practitioner (Y tá thực hành cao cấp)"
  ,"Physical Therapist (Chuyên gia vật lý trị liệu)"
  ,"Health Data Analyst (Phân tích dữ liệu sức khỏe)"
  ,"Telemedicine Specialist (Y tế từ xa, tư vấn online)"
  ,"Medical Illustrator (Minh họa y học)"
  
  // Kỹ thuật - Công nghiệp
  ,"Mechanical Design Engineer (Thiết kế máy móc tự động hóa)"
  ,"Civil Site Supervisor (Giám sát công trường xây dựng)"
  ,"Quality Control Engineer (Đảm bảo chất lượng quy trình sản xuất)"
  ,"Electronics Test Engineer (Kiểm tra bảng mạch, thiết bị điện tử)"
  ,"Renewable Energy Consultant (Chuyên gia năng lượng tái tạo)"
  
  // Sáng tạo - Nội dung - Nghệ thuật
  ,"Graphic Designer (Thiết kế đồ họa thương hiệu)"
  ,"Animator (Làm phim hoạt hình 2D/3D, Motion Graphics)"
  ,"Scriptwriter (Biên kịch phim, nội dung video YouTube)"
  ,"Photographer (Nhiếp ảnh gia sản phẩm, chân dung)"
  ,"Music Producer (Sản xuất nhạc số, thu âm giải trí)"
  
  // Khối pháp lý và Quản trị
  ,"Legal Advisor (Tư vấn luật doanh nghiệp)"
  ,"HR Business Partner (Phát triển nhân sự doanh nghiệp)"
  ,"Project Coordinator (Điều phối dự án đa lĩnh vực)"
  ,"Customer Success Specialist (Chăm sóc khách hàng cao cấp)"
  ,"Operations Manager (Quản lý vận hành nhiều phòng ban)"
];
const PASSWORD_MIN_LENGTH = 6;

// THỜI GIAN MÃ XÁC THỰC QUA MAIL
const ONE_MINUTE_IN_MS = 60 * 1000;
const ONE_HOUR_IN_SECONDS = 3600;

const RATE_LIMITER = Object.freeze({
  WINDOW_MS: 15 * ONE_MINUTE_IN_MS, // 15 phút
  MAX_REQUESTS: 10,
});

const TOKEN_EXPIRY = Object.freeze({
  PASSWORD_RESET: 10 * ONE_MINUTE_IN_MS, // 10 phút
});

const CACHE_DURATIONS = Object.freeze({
  ONE_DAY: ONE_HOUR_IN_SECONDS * 24,
  ONE_HOUR: ONE_HOUR_IN_SECONDS,
  TEN_MINUTES: 600,
});

module.exports = {
  ROLES,
  LOG_TYPES,
  LOG_STATUS,
  PROFILE_OPTIONS,
  SUGGESTION_GOALS,
  PASSWORD_MIN_LENGTH,
  RATE_LIMITER,
  TOKEN_EXPIRY,
  CACHE_DURATIONS,
};
