const redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

let redisClient;

// Kiểm tra xem các biến môi trường cần thiết có tồn tại không
if (process.env.REDIS_HOST && process.env.REDIS_PORT && process.env.REDIS_PASSWORD) {
    redisClient = redis.createClient({
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT
        }
    });

    redisClient.on('error', (err) => console.log('Lỗi kết nối Redis:', err.message));
    redisClient.on('connect', () => console.log('Đã kết nối thành công đến Redis!'));

    (async () => {
        try {
            await redisClient.connect();
        } catch (err) {
            console.error('Không thể kết nối đến Redis. Chức năng cache sẽ bị vô hiệu hóa.');
            redisClient = { isReady: false, get: async () => null, setEx: async () => {} };
        }
    })();
} else {
    console.warn('Thông tin kết nối Redis không đầy đủ. Chức năng cache sẽ bị vô hiệu hóa.');
    // Tạo một đối tượng giả để ứng dụng không bị lỗi khi gọi
    redisClient = {
        isReady: false,
        get: async () => null,
        setEx: async () => {},
    };
}

module.exports = redisClient;