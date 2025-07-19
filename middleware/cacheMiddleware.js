const redisClient = require('../config/redisClient');

const cache = (durationInSeconds) => async (req, res, next) => {
    // Nếu Redis không kết nối được, bỏ qua cache
    if (!redisClient.isReady) return next();

    const key = `__express__${req.originalUrl || req.url}`;
    
    try {
        const cachedResponse = await redisClient.get(key);
        if (cachedResponse) {
            console.log(`CACHE HIT: ${key}`);
            return res.json(JSON.parse(cachedResponse));
        }
    } catch (err) {
        console.error('Lỗi khi truy cập cache Redis:', err);
    }
    
    console.log(`CACHE MISS: ${key}`);
    const originalJson = res.json;
    res.json = (body) => {
        if (redisClient.isReady) {
            redisClient.setEx(key, durationInSeconds, JSON.stringify(body));
        }
        originalJson.call(res, body);
    };
    next();
};

module.exports = cache;