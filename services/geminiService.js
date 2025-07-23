const axios = require('axios');

function cleanAndParseJson(text) {
    const firstBracket = text.indexOf('{');
    const firstSquare = text.indexOf('[');
    let start = -1;
    if (firstBracket === -1) start = firstSquare;
    else if (firstSquare === -1) start = firstBracket;
    else start = Math.min(firstBracket, firstSquare);
    if (start === -1) throw new Error("Không tìm thấy đối tượng JSON trong phản hồi.");
    const lastBracket = text.lastIndexOf('}');
    const lastSquare = text.lastIndexOf(']');
    const end = Math.max(lastBracket, lastSquare);
    if (end === -1) throw new Error("Không tìm thấy ký tự kết thúc JSON hợp lệ.");
    const jsonString = text.substring(start, end + 1);
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Lỗi khi phân tích chuỗi JSON đã làm sạch:", jsonString);
        throw new Error("Không thể phân tích phản hồi JSON từ AI.");
    }
}

async function callGeminiAPI(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `${process.env.GEMINI_API_URL}?key=${apiKey}`;
    try {
        const response = await axios.post(apiUrl, {
            contents: [{ parts: [{ text: prompt }] }]
        });
        if (!response.data.candidates || response.data.candidates.length === 0) {
            throw new Error("API không trả về kết quả. Prompt có thể đã bị chặn.");
        }
        const responseText = response.data.candidates[0].content.parts[0].text;
        return cleanAndParseJson(responseText);
    } catch (error) {
        console.log(apiUrl);
        console.error("Lỗi khi gọi Gemini API:", error.response ? error.response.data : error.message);
        throw new Error('Lỗi khi giao tiếp với AI.');
    }
}

module.exports = { callGeminiAPI };