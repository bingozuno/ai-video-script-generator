<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Video Script & Prompt Expert

Ứng dụng này biến ý tưởng hoặc câu chuyện thành kịch bản video chi tiết, với các prompt tối ưu cho AI tạo hình ảnh (Whisk AI) và chuyển động (Veo 3.1). Nó cũng bao gồm một công cụ AI để xóa watermark khỏi ảnh.

**Lưu ý quan trọng:** Ứng dụng này yêu cầu người dùng tự cung cấp Gemini API Key của riêng họ để sử dụng.

---

## 🚀 Chạy trên máy (Run Locally)

**Yêu cầu:** Node.js

1.  **Tải code về (Clone)**
    (Thay `TEN_CUA_BAN/TEN_REPO` bằng tên thật của bạn trên GitHub)
    ```bash
    git clone [https://github.com/TEN_CUA_BAN/TEN_REPO.git](https://github.com/TEN_CUA_BAN/TEN_REPO.git)
    cd TEN_REPO
    ```

2.  **Cài đặt các gói phụ thuộc**
    ```bash
    npm install
    ```

3.  **Tạo tệp API Key**
    Sao chép tệp mẫu để tạo tệp key của riêng bạn:
    ```bash
    cp .env.example .env.local
    ```

4.  **Thêm Key của bạn**
    Mở tệp `.env.local` vừa tạo và dán Gemini API Key của bạn vào:
    ```
    GEMINI_API_KEY=DAY_LA_API_KEY_CUA_BAN
    ```

5.  **Chạy ứng dụng**
    ```bash
    npm run dev
    ```
    Mở trình duyệt và truy cập `http://localhost:3000`.

---
## 🔒 Về Bảo mật API Key

Ứng dụng này được thiết kế để sử dụng phía client (người dùng).
* **Khi chạy trên Vercel:** Ứng dụng sẽ yêu cầu người dùng nhập API key của họ. Key này chỉ tồn tại trong trình duyệt của họ và không được lưu trữ ở bất kỳ đâu.
* **Khi chạy trên máy (Locally):** Ứng dụng sử dụng key từ tệp `.env.local` của bạn, tệp này đã được `.gitignore` chặn lại và sẽ không bao giờ bị tải lên GitHub.