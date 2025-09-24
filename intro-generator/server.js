// server.js (Phiên bản sử dụng axios và mô hình gemini-2.5-flash)

// 1. Nạp các thư viện cần thiết
import express from 'express';
import cors from 'cors';
import axios from 'axios';

// 2. Khởi tạo
const app = express();
app.use(cors());
app.use(express.json());

// API Key được đặt trực tiếp vào code
const GEMINI_API_KEY = 'AIzaSyBkSHYFDLbO8KKInj4wF_YYubh4x3BUOfc'; 
// URL của Gemini API đã được đổi sang mô hình gemini-2.5-flash
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// Kiểm tra xem key có tồn tại không
if (!GEMINI_API_KEY) {
    console.error("Lỗi: Hằng số GEMINI_API_KEY chưa được thiết lập.");
    process.exit(1);
}

// 3. Xây dựng API Endpoint
app.post('/api/generate-intro', async (req, res) => {
    
    console.log("Đã nhận yêu cầu tạo intro...");
    const { main_topic, specific_problem, old_methods, solution, benefits } = req.body;

    if (!main_topic || !specific_problem || !old_methods || !solution || !benefits) {
        return res.status(400).json({ error: "Vui lòng điền đầy đủ tất cả các trường." });
    }
    
    console.log("Đang sử dụng API Key kết thúc bằng:", GEMINI_API_KEY.slice(-4));

    const promptTemplate = `
    You are a professional academic writing assistant. Write a complete **INTRODUCTION** for a scientific paper using the ideas below.

Target rhetorical flow: establish broad context → narrow to the specific problem → identify limitations/gaps in prior work → introduce the proposed approach → highlight key contributions/benefits.

Inputs:
• Main topic (context): ${main_topic}
• Specific problem: ${specific_problem}
• Limitations of prior methods (gap): ${old_methods}
• Proposed solution/method: ${solution}
• Key benefits/contributions: ${benefits}

Requirements:
- Language: **English**; formal, academic, objective, and cohesive.
- Structure: **2 to 4 paragraphs** with natural transitions (e.g., “However…”, “Therefore…”, “To address this limitation…”); **no bullet points** or headings.
- Length: **180 to 260 words**.
- Do **not** invent datasets, quantitative results, or specific citations. If mentioning related work, use a placeholder like **[ref]**.
- Clearly articulate the **novelty** vs. prior approaches and the **practical/theoretical benefits** of the proposed method.
- Prefer a neutral academic voice; you may use “we” when introducing the proposed method.

Output only the plain text of the Introduction (no titles, notes, or extra commentary).
    `;

    // Tạo payload (dữ liệu gửi đi)
    const payload = {
        contents: [
            {
                role: "user",
                parts: [{ text: promptTemplate }]
            }
        ],
    };

    try {
        // Sử dụng axios để gửi yêu cầu POST tới Gemini API
        const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, payload, {
            headers: { 'Content-Type': 'application/json' },
        });

        const result = response.data;
        const introductionText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (introductionText) {
            res.status(200).json({ introduction: introductionText });
            console.log("Đã gửi kết quả về cho Frontend.");
        } else {
            console.error("Lỗi: Không tìm thấy nội dung phản hồi từ Gemini.");
            res.status(500).json({ error: "Đã có lỗi xảy ra từ phía server hoặc API của Gemini." });
        }
    } catch (error) {
        console.error("Lỗi khi gọi API Gemini:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Đã có lỗi xảy ra từ phía server hoặc API của Gemini." });
    }
});

// 4. Khởi động server
const PORT = 3001;
app.listen(PORT, () => {
    console.log('🚀 Server đang lắng nghe tại http://localhost:${PORT}');
});