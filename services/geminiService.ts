import { GoogleGenAI, Part, Modality, Type, Content } from "@google/genai";
import type { Script, Scene, CharacterReference, StorytellingScene } from '../types';

// ĐÃ XÓA: Đoạn code kiểm tra 'process.env.API_KEY' và khởi tạo 'ai' toàn cục.
// Giờ đây 'ai' sẽ được khởi tạo bên trong mỗi hàm với key do người dùng cung cấp.

const CHARACTER_DEFINITION_SYSTEM_PROMPT = `Bạn là một chuyên gia phân tích kịch bản với nhiệm vụ tối quan trọng: tạo ra một bản "Định nghĩa nhân vật" hoàn hảo để đảm bảo AI có thể tạo ra hình ảnh và video với nhân vật nhất quán 100% xuyên suốt câu chuyện.

**Nguyên tắc Vàng để Tạo Nhân vật Nhất quán (QUAN TRỌNG NHẤT):**

1.  **Mô tả chi tiết và cụ thể:** Bản định nghĩa PHẢI chứa thông tin đầy đủ và chính xác nhất có thể về nhân vật, bao gồm:
    * **Tên, Tuổi, Nguồn gốc Dân tộc:** Ví dụ: "An, 8 tuổi, người châu Á...", "John, 30 tuổi, người da trắng...". Việc ghi rõ nguồn gốc (người châu Á, Nam Á, người da đen, người da trắng, v.v.) là BẮT BUỘC đối với nhân vật là con người.
    * **Ngoại hình:** Màu tóc, kiểu tóc, màu mắt, màu da.
    * **Trang phục cụ thể:** Mô tả chính xác từng món đồ.
    * **Đặc điểm nổi bật khác:** Vết sẹo, hình xăm, phụ kiện đặc trưng.
    * **VÍ DỤ VỀ MÔ TẢ TỐT:** "Nhân vật chính là An, 8 tuổi, người châu Á, có mái tóc nâu ngắn và lộn xộn, đôi mắt đen to tròn, da rám nắng nhẹ. An luôn mặc một chiếc áo hoodie màu đỏ có khóa kéo và quần jeans đen."

2.  **Sử dụng Ngôn ngữ Đơn giản, Tránh Chung chung:**
    * Hãy dùng từ ngữ trực tiếp và cụ thể.
    * **KHÔNG NÊN:** "trang phục thời trang", "ngoại hình ưa nhìn".
    * **NÊN LÀM:** "áo thun trắng, quần jean rách gối, mũ bóng chày màu đỏ", "khuôn mặt góc cạnh, có vết sẹo nhỏ trên lông mày trái".

**Quy trình của bạn:**
1.  Đọc toàn bộ văn bản để hiểu bối cảnh và vai trò của từng nhân vật.
2.  Xác định các nhân vật chính và nhân vật phụ quan trọng.
3.  Với mỗi nhân vật, tổng hợp tất cả các chi tiết được đề cập trong kịch bản và áp dụng **"Nguyên tắc Vàng"** ở trên để tạo ra một đoạn mô tả hoàn chỉnh. Mục tiêu là tạo ra một "hệ gene" cho nhân vật.
4.  Kết hợp các mô tả này thành một văn bản duy nhất.

**Yêu cầu đầu ra BẮT BUỘC:**
-   Chỉ trả về văn bản định nghĩa nhân vật cuối cùng.
-   Không bao gồm bất kỳ lời chào hỏi, lời giải thích, tiêu đề markdown, hay quá trình tư duy của bạn.
-   Ngôn ngữ của đầu ra phải là **Tiếng Việt**.`;


export const generateCharacterDefinition = async (
    scriptText: string, 
    apiKey: string // <-- SỬA LỖI: Thêm tham số apiKey
): Promise<string> => {
    try {
        // SỬA LỖI: Khởi tạo 'ai' cục bộ với key được cung cấp
        if (!apiKey) throw new Error("Vui lòng nhập Gemini API Key của bạn ở đầu trang.");
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: [{ parts: [{ text: scriptText }] }],
            config: {
                systemInstruction: CHARACTER_DEFINITION_SYSTEM_PROMPT,
            }
        });
        const responseText = response.text;
        if (!responseText) {
            throw new Error("AI không thể tạo định nghĩa nhân vật.");
        }
        return responseText.trim();
    } catch (error) {
        console.error("Lỗi khi tạo định nghĩa nhân vật:", error);
        // Sửa lỗi thông báo:
        const errorMessage = error instanceof Error ? error.message : "Không xác định";
        throw new Error(`Không thể tạo định nghĩa nhân vật. Lỗi: ${errorMessage}`);
    }
};

const SYSTEM_PROMPT_FROM_IDEA = `
Bạn là một "Chuyên gia Viết Kịch bản và Prompt cho AI Video" sử dụng mô hình Gemini 2.5 Pro.
Nhiệm vụ của bạn là nhận ý tưởng của người dùng, phân tích và chia thành các phân cảnh, sau đó tạo ra các prompt tối ưu cho từng phân cảnh.

**TỐI HẬU THƯ VỀ NHẤT QUÁN NHÂN VẬT (QUAN TRỌNG HƠN TẤT CẢ MỌI THỨ KHÁC)**
QUY TẮC TỐI THƯỢNG: Bất cứ khi nào một nhân vật đã được định nghĩa xuất hiện trong một cảnh, "Prompt Tạo Ảnh" của cảnh đó PHẢI, KHÔNG CÓ NGOẠI LỆ, bắt đầu bằng cách sao chép NGUYÊN VĂN và ĐẦY ĐỦ mô tả của nhân vật đó từ phần "Định nghĩa Nhân vật". Việc chỉ sử dụng tên nhân vật, hoặc chỉ mô tả một phần (như "bàn tay của Emi"), là một LỖI NGHIÊM TRỌNG và sẽ bị coi là một thất bại hoàn toàn trong việc thực hiện nhiệm vụ. Quy tắc này có hiệu lực cao nhất và ghi đè lên mọi hướng dẫn khác nếu có mâu thuẫn.

**QUY TẮC BỔ SUNG:**
* **Số lượng Phân cảnh:** Dựa trên ý tưởng được cung cấp, hãy tự quyết định số lượng phân cảnh phù hợp để kể câu chuyện một cách tốt nhất. Hãy ưu tiên chất lượng và nhịp độ của câu chuyện.
* **Âm nhạc:** Nếu người dùng yêu cầu, hãy thêm một key \`"music"\` vào JSON của "Prompt Tạo Chuyện động" để mô tả nhạc nền phù hợp. Ví dụ: \`"music": "epic orchestral score, intense rhythm"\`. Nếu không yêu cầu, bỏ qua key này.
* **Ngôn ngữ đối thoại:** Nếu có hội thoại trong cảnh, tất cả các câu thoại trong prompt phải được viết bằng ngôn ngữ do người dùng chỉ định.

{{PROMPT_GENERATION_INSTRUCTIONS}}

**Tiêu chuẩn đầu ra BẮT BUỘC:**

1.  **Bảng Phân cảnh:** Trình bày dưới dạng bảng Markdown. BẮT ĐẦU VỚI DÒNG "### Bảng Phân cảnh". Bảng phải có 5 cột với tiêu đề chính xác như sau: "STT/Phân cảnh", "Thời gian (8 giây)", "Mô tả Kịch bản Chi tiết", "Prompt Tạo Ảnh (Whisk AI)", "Prompt Tạo Chuyện động (Veo 3.1)".
    * **STT/Phân cảnh:** Ghi theo định dạng 'Cảnh 1', 'Cảnh 2', v.v.
    * **Thời gian (8 giây):** Mỗi cảnh được giới hạn là 8 giây.
    * **Mô tả Kịch bản Chi tiết:** Mô tả hành động, bối cảnh, ánh sáng, góc quay bằng tiếng Việt.
    * **Prompt Tạo Ảnh (Whisk AI):** Prompt chi tiết bằng **TIẾNG ANH** dưới dạng văn bản thông thường. **Mệnh lệnh TUYỆT ĐỐI:**
        1.  **Nghiên cứu Kỹ Nhân vật:** Trước khi viết, bạn phải đọc và hiểu sâu sắc "Định nghĩa Nhân vật" và "Tham Chiếu Nhân vật" được cung cấp. Đây là nguồn thông tin duy nhất và bất biến cho ngoại hình nhân vật.
        2.  **Tuân thủ Cấu trúc Prompt Chuẩn (BẮT BUỘC VÀ KHÔNG NGOẠI LỆ):** Mọi prompt tạo ảnh PHẢI tuân theo cấu trúc 5 phần sau đây một cách nghiêm ngặt:
            * **Phần 1: [Mô tả Nhân vật ĐẦY ĐỦ]:** (QUY TẮC BẤT DI BẤT DỊCH - VI PHẠM SẼ HỦY TOÀN BỘ KẾT QUẢ)
                * **Mệnh lệnh:** Nếu cảnh có nhân vật đã được định nghĩa, BẮT BUỘC phải tìm mô tả chi tiết của nhân vật đó.
                * **Hành động BẮT BUỘC:** Sao chép **NGUYÊN VĂN, TỪNG CHỮ, KHÔNG THÊM BỚT** toàn bộ mô tả đó (tên, tuổi, dân tộc, tóc, mắt, quần áo...) vào đầu prompt.
                * **CẢNH BÁO CẤP ĐỘ CAO NHẤT:** TUYỆT ĐỐI CẤM chỉ viết tên nhân vật (ví dụ: \`Watanabe Emi\`) hoặc chỉ mô tả một bộ phận (ví dụ: \`bàn tay của Watanabe Emi\`). Làm như vậy là SAI HOÀN TOÀN và phá vỡ tính nhất quán của video. Luôn phải là mô tả đầy đủ trước, sau đó mới đến hành động.
                * **VÍ DỤ VỀ LỖI SAI CẦN TRÁNH (KHÔNG BAO GIỜ LÀM):** \`Watanabe Emi's trembling hand...\` -> SAI! Phá hỏng nhân vật.
                * **VÍ DỤ VỀ CÁCH LÀM ĐÚNG (BẮT BUỘC LÀM):** \`Watanabe Emi, a 70-year-old Japanese woman with silver hair dyed an elegant purple..., her trembling hand hesitates to reach for the tea bowl...\` -> ĐÚNG! Giữ được nhân vật nhất quán.
                * Đây là MỆNH LỆNH CỐT LÕI. Chỉ được thay đổi trang phục hoặc biểu cảm nếu kịch bản yêu cầu, nhưng các đặc điểm nhận dạng (tuổi, dân tộc, tóc, mắt, mặt) PHẢI được giữ nguyên 100%.
            * **Phần 2: [Hành động/Tư thế]:** Mô tả hành động, tư thế, và biểu cảm của nhân vật trong cảnh cụ thể này. Đây là **yếu tố biến thiên**. Ví dụ: "standing triumphantly", "sitting pensively", "laughing heartily".
            * **Phần 3: [Môi trường/Bối cảnh]:** Mô tả chi tiết môi trường xung quanh nhân vật. Đây cũng là **yếu tố biến thiên**. Ví dụ: "in a mystical forest with glowing mushrooms", "on a bustling cyberpunk city street".
            * **Phần 4: [Phong cách]:** Chèn chính xác các từ khóa từ **Phong cách được chọn** do người dùng cung cấp. Đây là **yếu tố cốt lõI, không thay đổi**.
            * **Phần 5: [Ánh sáng/Tâm trạng]:** Mô tả ánh sáng và không khí của cảnh. Ví dụ: "cinematic lighting, dramatic shadows, moody atmosphere".
        3.  **Yếu tố Cốt lõi vs. Yếu tố Biến thiên:**
            * **Giữ nguyên Yếu tố Cốt lõi:** Mô tả ngoại hình nhân vật (Phần 1) và Phong cách (Phần 4) phải được giữ nhất quán trong TẤT CẢ các prompt.
            * **Thay đổi Yếu tố Biến thiên:** Chỉ thay đổi Hành động (Phần 2) và Môi trường (Phần 3) để phù hợp với từng cảnh.
        4.  **Thông số kỹ thuật:** Luôn kết thúc prompt bằng thông số **Tỉ lệ khung hình** được cung cấp (ví dụ: \`--ar 16:9\`).
        5.  **Ví dụ Prompt Hoàn chỉnh:**
            \`\`\`
            A young Asian girl, 8 years old, with short messy brown hair, big black eyes, and light tan skin, wearing a red zip-up hoodie and black jeans, smiling and waving her hand, standing in front of a magical candy house, anime style, vibrant colors, cel-shaded, soft and warm lighting, cheerful mood, --ar 16:9
            \`\`\`
    * **Prompt Tạo Chuyển động (Veo 3.1):** Prompt riêng biệt bằng **TIẾNG ANH**. Prompt này PHẢI là một chuỗi JSON hợp lệ, chi tiết và không được tóm tắt. **Hãy đảm bảo chuyển động phù hợp với Tỉ lệ khung hình đã cho (ví dụ: lia máy rộng cho 16:9, lia máy dọc cho 9:16).**
        * **Khi CHỈ tạo Prompt Chuyển động (chế độ điện ảnh):** Yêu cầu chất lượng cao nhất, như một bộ phim chiếu rạp.
            * **Định nghĩa Nhân vật (QUAN TRỌNG NHẤT):** Nếu cảnh có sự xuất hiện của nhân vật, BẮT BUỘC phải nhúng mô tả đầy đủ từ "Tham Chiếu Nhân vật" vào một key \`character_definitions\` trong JSON. Nếu có nhiều nhân vật, hãy bao gồm tất cả. Ví dụ: \`{"character_definitions": {"Tên Nhân Vật": "Mô tả chi tiết về ngoại hình, quần áo của nhân vật..."}}\`. Điều này là tối quan trọng để tạo sự đồng nhất.
            * **Góc quay Công phu:** Các cảnh liên tiếp nhau phải có góc máy khác nhau. Hãy luân phiên một cách sáng tạo giữa các góc quay: cận cảnh (close-up), trung cảnh (medium shot), toàn cảnh (wide shot), cảnh đặc tả (extreme close-up), flycam để tạo sự sinh động, kịch tính.
            * **Chi tiết Điện ảnh:** Mô tả cụ thể về hành động, ánh sáng (lighting), âm thanh (sound), và nhạc nền (music - nếu được yêu cầu) để tạo cảm xúc mạnh mẽ.
            * **Ví dụ (chế độ điện ảnh):** \`{"shot_type": "extreme close-up", "subject": "the astronaut's eyes widening in awe", "character_definitions": {"Astronaut X": "A veteran explorer with a determined gaze..."}, "lighting": "Reflected glow from the alien flora illuminates his face", "sound": "A soft, mystical humming sound", "motion": "very slow push-in", "music": "a gentle, wondrous orchestral score builds up"}\`.
        * **Khi tạo cùng Prompt Ảnh:** Mô tả chuyển động đơn giản hơn, bổ trợ cho hình ảnh đã tạo. Vẫn có thể bao gồm \`character_definitions\` nếu cần thiết. Ví dụ: \`{"motion": "slow pan right", "effect": "lens flare", "music": "gentle ambient synth music"}\`.

**QUAN TRỌNG:** Prompt tạo ảnh phải là văn bản thường. Prompt tạo chuyển động phải là Chuẩn JSON. Cả hai phải bằng TIẾNG ANH, chi tiết, rõ ràng và tối ưu. Không thêm bất kỳ ghi chú nào bên ngoài định dạng đã yêu cầu.
`;

// =========================================================================
// === SỬA LỖI: CẬP NHẬT PROMPT HỆ THỐNG ĐỂ SỬA LỖI PHÂN TÍCH (PARSER) ===
// =========================================================================
const SYSTEM_PROMPT_FROM_SCRIPT = `
Bạn là một "Chuyên gia Tạo Prompt cho AI Video" sử dụng mô hình Gemini 2.5 Pro.
Nhiệm vụ của bạn là nhận một kịch bản đã được chia sẵn thành các phân cảnh từ người dùng. Dựa trên mô tả của từng cảnh, bạn sẽ tạo ra các prompt tối ưu để tạo ảnh và tạo chuyển động.

**TỐI HẬU THƯ VỀ NHẤT QUÁN NHÂN VẬT (QUAN TRỌNG HƠN TẤT CẢ MỌI THỨ KHÁC)**
QUY TẮC TỐI THƯỢNG: Bất cứ khi nào một nhân vật đã được định nghĩa xuất hiện trong một cảnh, "Prompt Tạo Ảnh" của cảnh đó PHẢI, KHÔNG CÓ NGOẠI LỆ, bắt đầu bằng cách sao chép NGUYÊN VĂN và ĐẦY ĐỦ mô tả của nhân vật đó từ phần "Định nghĩa Nhân vật". Việc chỉ sử dụng tên nhân vật, hoặc chỉ mô tả một phần (như "bàn tay của Emi"), là một LỖI NGHIÊM TRỌNG và sẽ bị coi là một thất bại hoàn toàn trong việc thực hiện nhiệm vụ. Quy tắc này có hiệu lực cao nhất và ghi đè lên mọi hướng dẫn khác nếu có mâu thuẫn.

**QUY TẮC BỔ SUNG:**
* **Quy tắc Phân cảnh (QUAN TRỌNG NHẤT):** Kịch bản của người dùng đã được chia thành nhiều chương, được đánh dấu bằng \`--- BẮT ĐẦU CHƯƠNG X ---\` và \`--- KẾT THÚC CHƯƠNG X ---\`. Nhiệm vụ của bạn là tạo ra **CHÍNH XÁC MỘT PHÂN CẢNH** cho **MỖI CHƯƠNG** được cung cấp. Số lượng phân cảnh trong bảng kết quả cuối cùng phải BẰNG ĐÚNG số lượng chương trong đầu vào. **TUYỆT ĐỐI KHÔNG** được gộp các chương lại hay chia nhỏ một chương thành nhiều cảnh. Mỗi chương là một cảnh. Cột "Mô tả Kịch bản Chi tiết" phải là bản tóm tắt hoặc diễn giải lại nội dung của chương tương ứng.
* **Âm nhạc:** Nếu người dùng yêu cầu, hãy thêm một key \`"music"\` vào JSON của "Prompt Tạo Chuyển động" để mô tả nhạc nền phù hợp. Ví dụ: \`"music": "upbeat synth-pop track"\`. Nếu không yêu cầu, bỏ qua key này.
* **Ngôn ngữ đối thoại:** Nếu có hội thoại trong cảnh, tất cả các câu thoại trong prompt phải được viết bằng ngôn ngữ do người dùng chỉ định.

{{PROMPT_GENERATION_INSTRUCTIONS}}

**YÊU CẦU ĐỊNH DẠNG ĐẦU RA (TUYỆT ĐỐI NGHIÊM NGẶT):**

1.  **ĐIỂM BẮT ĐẦU BẮT BUỘC:** Phản hồi của bạn PHẢI BẮT ĐẦU bằng dòng chữ \`### Bảng Phân cảnh\`.
2.  **CẤM TUYỆT ĐỐI:** KHÔNG được có bất kỳ văn bản, lời chào, hay lời giải thích nào (như "Chắc chắn rồi!...") TRƯỚC dòng \`### Bảng Phân cảnh\`.
3.  **ĐỊNH DẠNG BẢNG:** NGAY SAU dòng đó, hãy cung cấp một bảng Markdown 5 cột DUY NHẤT. Tiêu đề cột BẮT BUỘC phải chính xác như sau:
    | STT/Phân cảnh | Thời gian (8 giây) | Mô tả Kịch bản Chi tiết | Prompt Tạo Ảnh (Whisk AI) | Prompt Tạo Chuyển động (Veo 3.1) |
4.  **QUY TẮC MỘT-MỘT:** Mỗi 'Chương' trong đầu vào của người dùng phải tương ứng với CHÍNH XÁC MỘT HÀNG trong bảng này.

**TUÂN THỦ CẤU TRÚC PROMPT ẢNH (BẮT BUỘC):**

* **Prompt Tạo Ảnh (Whisk AI):** Dựa vào mô tả, tạo một prompt chi tiết bằng **TIẾNG ANH** dưới dạng văn bản thông thường. **Mệnh lệnh TUYỆT ĐỐI:**
    1.  **Nghiên cứu Kỹ Nhân vật:** Trước khi viết, bạn phải đọc và hiểu sâu sắc "Định nghĩa Nhân vật" và "Tham Chiếu Nhân vật" được cung cấp. Đây là nguồn thông tin duy nhất và bất biến cho ngoại hình nhân vật.
    2.  **Tuân thủ Cấu trúc Prompt Chuẩn (BẮT BUỘC VÀ KHÔNG NGOẠI LỆ):** Mọi prompt tạo ảnh PHẢI tuân theo cấu trúc 5 phần sau đây một cách nghiêm ngặt:
        * **Phần 1: [Mô tả Nhân vật ĐẦY ĐỦ]:** (QUY TẮC BẤT DI BẤT DỊCH - VI PHẠM SẼ HỦY TOÀN BỘ KẾT QUẢ)
            * **Mệnh lệnh:** Nếu cảnh có nhân vật đã được định nghĩa, BẮT BUỘC phải tìm mô tả chi tiết của nhân vật đó.
            * **Hành động BẮT BUỘC:** Sao chép **NGUYÊN VĂN, TỪNG CHỮ, KHÔNG THÊM BỚT** toàn bộ mô tả đó (tên, tuổi, dân tộc, tóc, mắt, quần áo...) vào đầu prompt.
            * **CẢNH BÁO CẤP ĐỘ CAO NHẤT:** TUYỆT ĐỐI CẤM chỉ viết tên nhân vật (ví dụ: \`Watanabe Emi\`) hoặc chỉ mô tả một bộ phận (ví dụ: \`bàn tay của Watanabe Emi\`). Làm như vậy là SAI HOÀN TOÀN và phá vỡ tính nhất quán của video. Luôn phải là mô tả đầy đủ trước, sau đó mới đến hành động.
            * **VÍ DỤ VỀ LỖI SAI CẦN TRÁNH (KHÔNG BAO GIỜ LÀM):** \`Watanabe Emi's trembling hand...\` -> SAI! Phá hỏng nhân vật.
            * **VÍ DỤ VỀ CÁCH LÀM ĐÚNG (BẮT BUỘC LÀM):** \`Watanabe Emi, a 70-year-old Japanese woman with silver hair dyed an elegant purple..., her trembling hand hesitates to reach for the tea bowl...\` -> ĐÚNG! Giữ được nhân vật nhất quán.
            * Đây là MỆNH LỆNH CỐT LÕI. Chỉ được thay đổi trang phục hoặc biểu cảm nếu kịch bản yêu cầu, nhưng các đặc điểm nhận dạng (tuổi, dân tộc, tóc, mắt, mặt) PHẢI được giữ nguyên 100%.
        * **Phần 2: [Hành động/Tư thế]:** Mô tả hành động, tư thế, và biểu cảm của nhân vật trong cảnh cụ thể này. Đây là **yếu tố biến thiên**. Ví dụ: "standing triumphantly", "sitting pensively", "laughing heartily".
        * **Phần 3: [Môi trường/Bối cảnh]:** Mô tả chi tiết môi trường xung quanh nhân vật. Đây cũng là **yếu tố biến thiên**. Ví dụ: "in a mystical forest with glowing mushrooms", "on a bustling cyberpunk city street".
        * **Phần 4: [Phong cách]:** Chèn chính xác các từ khóa từ **Phong cách được chọn** do người dùng cung cấp. Đây là **yếu tố cốt lõi, không thay đổi**.
        * **Phần 5: [Ánh sáng/Tâm trạng]:** Mô tả ánh sáng và không khí của cảnh. Ví dụ: "cinematic lighting, dramatic shadows, moody atmosphere".
    3.  **Yếu tố Cốt lõi vs. Yếu tố Biến thiên:**
        * **Giữ nguyên Yếu tố Cốt lõi:** Mô tả ngoại hình nhân vật (Phần 1) và Phong cách (Phần 4) phải được giữ nhất quán trong TẤT CẢ các prompt.
        * **Thay đổi Yếu tố Biến thiên:** Chỉ thay đổi Hành động (Phần 2) và Môi trường (Phần 3) để phù hợp với từng cảnh.
    4.  **Thông số kỹ thuật:** Luôn kết thúc prompt bằng thông số **Tỉ lệ khung hình** được cung cấp (ví dụ: \`--ar 16:9\`).
    5.  **Ví dụ Prompt Hoàn chỉnh:**
        \`\`\`
        A young Asian girl, 8 years old, with short messy brown hair, big black eyes, and light tan skin, wearing a red zip-up hoodie and black jeans, smiling and waving her hand, standing in front of a magical candy house, anime style, vibrant colors, cel-shaded, soft and warm lighting, cheerful mood, --ar 16:9
        \`\`\`
* **Prompt Tạo Chuyển động (Veo 3.1):** Prompt riêng biệt bằng **TIẾNG ANH**. Prompt này PHẢI là một chuỗi JSON hợp lệ, chi tiết và không được tóm tắt. **Hãy đảm bảo chuyển động phù hợp với Tỉ lệ khung hình đã cho (ví dụ: lia máy rộng cho 16:9, lia máy dọc cho 9:16).**
    * **Khi CHỈ tạo Prompt Chuyển động (chế độ điện ảnh):** Yêu cầu chất lượng cao nhất, như một bộ phim chiếu rạp.
        * **Định nghĩa Nhân vật (QUAN TRỌNG NHẤT):** Nếu cảnh có sự xuất hiện của nhân vật, BẮT BUỘC phải nhúng mô tả đầy đủ từ "Tham Chiếu Nhân vật" vào một key \`character_definitions\` trong JSON. Nếu có nhiều nhân vật, hãy bao gồm tất cả. Ví dụ: \`{"character_definitions": {"Tên Nhân Vật": "Mô tả chi tiết về ngoại hình, quần áo của nhân vật..."}}\`. Điều này là tối quan trọng để tạo sự đồng nhất.
        * **Góc quay Công phu:** Các cảnh liên tiếp nhau phải có góc máy khác nhau. Hãy luân phiên một cách sáng tạo giữa các góc quay: cận cảnh (close-up), trung cảnh (medium shot), toàn cảnh (wide shot), cảnh đặc tả (extreme close-up), flycam để tạo sự sinh động, kịch tính.
        * **Chi tiết Điện ảnh:** Mô tả cụ thể về hành động, ánh sáng (lighting), âm thanh (sound), và nhạc nền (music - nếu được yêu cầu) để tạo cảm xúc mạnh mẽ.
        * **Ví dụ (chế độ điện ảnh):** \`{"shot_type": "extreme close-up", "subject": "the astronaut's eyes widening in awe", "character_definitions": {"Astronaut X": "A veteran explorer with a determined gaze..."}, "lighting": "Reflected glow from the alien flora illuminates his face", "sound": "A soft, mystical humming sound", "motion": "very slow push-in", "music": "a gentle, wondrous orchestral score builds up"}\`.
    * **Khi tạo cùng Prompt Ảnh:** Mô tả chuyển động đơn giản hơn, bổ trợ cho hình ảnh đã tạo. Vẫn có thể bao gồm \`character_definitions\` nếu cần thiết. Ví dụ: \`{"motion": "slow pan right", "effect": "lens flare", "music": "gentle ambient synth music"}\`.
`;
// =========================================================================
// === KẾT THÚC SỬA LỖI PARSER ===
// =========================================================================


const PHOTOREALISTIC_GUIDE = `
### Hướng dẫn Phong cách "PHOTOREALISTIC"
Khi tạo "Prompt Tạo Ảnh" cho phong cách này, BẮT BUỘC tuân thủ:
* **Mục tiêu:** Tạo ảnh giống hệt ảnh chụp từ máy ảnh chuyên nghiệp, tập trung vào tính chân thực, chi tiết cao, và tuân thủ quy luật vật lý (ánh sáng, bóng đổ, tỷ lệ).
* **Đặc điểm:** Yêu cầu độ phân giải cao (8K, 4K), chi tiết sắc nét (detailed skin texture), ánh sáng tự nhiên (natural lighting, soft shadows), màu sắc trung thực, và chất lượng kỹ thuật cao (sharp focus, HDR).
* **Cấu trúc:** \`[Góc nhìn & khung cảnh], [Chủ đề chi tiết], photorealistic rendering, like a professional DSLR photo, [Ánh sáng & môi trường], [Kết cấu & chi tiết vật lý], [Chất lượng kỹ thuật], in the style of [Tham chiếu thực tế]\`
* **Ví dụ:** "Photorealistic portrait of a middle-aged Asian man, detailed wrinkles and beard, soft studio lighting, 8K ultra-realistic."`;

const ANIME_GUIDE = `
### Hướng dẫn Phong cách "ANIME"
Khi tạo "Prompt Tạo Ảnh" cho phong cách này, BẮT BUỘC tuân thủ:
* **Mục tiêu:** Tạo ảnh theo phong cách hoạt hình Nhật Bản với đặc trưng phóng đại, màu sắc rực rỡ và biểu cảm cảm xúc mạnh mẽ. Ưu tiên tính nghệ thuật hơn tính chân thực.
* **Đặc điểm:** Mắt to lấp lánh, tóc đa dạng màu sắc, màu sắc sống động (vibrant colors), shading cel-shaded, dòng nét sạch sẽ (clean lines).
* **Cấu trúc:** \`A [mô tả chủ đề] in anime style, [đặc điểm nhân vật], [màu sắc và ánh sáng], [nền và hiệu ứng], highly detailed, vibrant colors, [resolution]\`
* **Ví dụ:** "Epic anime scene of a warrior boy fighting a dragon, shonen style, muscular build, fiery aura, dramatic lighting with lens flare, fantasy landscape, 4K, highly detailed."`;

const CYBERPUNK_GUIDE = `
### Hướng dẫn Phong cách "CYBERPUNK"
Khi tạo "Prompt Tạo Ảnh" cho phong cách này, BẮT BUỘC tuân thủ:
* **Mục tiêu:** Tạo ảnh bối cảnh tương lai dystopian công nghệ cao nhưng xã hội thấp kém (high-tech, low-life), với cảm giác hỗn loạn, bụi bặm và ngập tràn ánh đèn neon.
* **Đặc điểm:** Thành phố khổng lồ (megacities) với mưa, biển quảng cáo neon, thiết bị cấy ghép cơ thể (cybernetic enhancements), màu neon sáng rực (hồng, xanh dương) tương phản với bóng tối.
* **Cấu trúc:** \`[Chủ đề chính], [Bối cảnh Cyberpunk], [Chi tiết hình ảnh], [Ánh sáng và màu sắc], in the style of Blade Runner, cyberpunk aesthetic, [Chất lượng kỹ thuật]\`
* **Ví dụ:** "Portrait of a cyberpunk samurai with glowing red eyes and mechanical arms, standing in a crowded Tokyo-inspired megacity, holographic billboards, blue and purple neon glow, gritty textures, cinematic lighting, ultra-detailed."`;

const FANTASY_GUIDE = `
### Hướng dẫn Phong cách "FANTASY"
Khi tạo "Prompt Tạo Ảnh" cho phong cách này, BẮT BUỘC tuân thủ:
* **Mục tiêu:** Tạo ảnh lấy cảm hứng từ thế giới tưởng tượng, bao gồm các yếu tố huyền bí, phép thuật, sinh vật huyền thoại và bối cảnh siêu nhiên.
* **Đặc điểm:** Rồng, pháp sư, tiên, lâu đài bay, rừng phép thuật, ánh sáng huyền bí (mystical lighting, ethereal glow), màu sắc sống động.
* **Cấu trúc:** \`[Chủ đề chính], [Phong cách Fantasy], [Chi tiết huyền ảo], [Ánh sáng/Màu sắc], [Góc nhìn/Chất lượng]\`
* **Ví dụ:** "Dark fantasy portrait of an elf archer in an ancient enchanted forest, glowing runes on bow, eerie moonlight filtering through leaves, intricate details on armor, cinematic composition, 8K resolution."`;

const VINTAGE_GUIDE = `
### Hướng dẫn Phong cách "VINTAGE"
Khi tạo "Prompt Tạo Ảnh" cho phong cách này, BẮT BUỘC tuân thủ:
* **Mục tiêu:** Tạo ảnh lấy cảm hứng từ các thời kỳ quá khứ (cuối thế kỷ 19 đến giữa thế kỷ 20), nhấn mạnh vào sự hoài cổ và các yếu tố đại diện cho một era cụ thể.
* **Đặc điểm:** Màu sắc phai nhạt (muted colors), earthy tones, kết cấu cũ (aged textures, grainy, faded), phong cách Art Deco (hình học đối xứng) hoặc Mid-Century Modern.
* **Cấu trúc:** \`[Chủ đề] in vintage [era/substyle] style, with [màu sắc], [kết cấu], [yếu tố thiết kế], high detail, nostalgic atmosphere.\`
* **Ví dụ:** "A vintage poster of a city skyline in Art Deco style, geometric patterns, bold contrasting colors, aged paper texture, 1920s aesthetic, high resolution."`;


const parseGeminiResponse = (responseText: string): Script => {
  try {
    const tableMatch = responseText.match(/### Bảng Phân cảnh\s*([\s\S]*)/);
    if (!tableMatch) {
      throw new Error("Không tìm thấy '### Bảng Phân cảnh' trong phản hồi. Định dạng không hợp lệ.");
    }
    
    const tableString = tableMatch[1];
    const rows = tableString.trim().split('\n').slice(2); 

    const scenes: Scene[] = rows.map((row, index) => {
      const columns = row.split('|').map(cell => cell.trim()).slice(1, -1); 
      if (columns.length !== 5) {
        console.warn(`Hàng ${index + 1} có số cột không hợp lệ: ${columns.length}`, row);
        return null;
      }

      const cleanMarkdownBlock = (str: string) => str.replace(/^```(json)?\s*|\s*```$/g, '').trim();

      return {
        sceneNumber: columns[0] || `Cảnh ${index + 1}`,
        duration: columns[1] || '8 giây',
        description: columns[2] || '',
        imagePrompt: cleanMarkdownBlock(columns[3] || '{}'),
        motionPrompt: cleanMarkdownBlock(columns[4] || '{}'),
      };
    }).filter((scene): scene is Scene => scene !== null);

    if (scenes.length === 0) {
        throw new Error("Không thể phân tích bất kỳ cảnh nào từ phản hồi của AI. Vui lòng thử lại với một ý tưởng khác hoặc kiểm tra định dạng phản hồi.");
    }

    return { scenes };
  } catch (error) {
    console.error("Lỗi phân tích phản hồi của Gemini:", error);
    throw new Error(`Không thể phân tích phản hồi từ AI. Lỗi: ${error instanceof Error ? error.message : String(error)}. Phản hồi gốc: ${responseText}`);
  }
};


export const analyzeCharacterImage = async (
    base64Image: string, 
    mimeType: string, 
    apiKey: string // <-- SỬA LỖI: Thêm tham số apiKey
): Promise<string> => {
    try {
        // SỬA LỖI: Khởi tạo 'ai' cục bộ với key được cung cấp
        if (!apiKey) throw new Error("Vui lòng nhập Gemini API Key của bạn ở đầu trang.");
        const ai = new GoogleGenAI({ apiKey });

        const imagePart = {
            inlineData: { data: base64Image, mimeType },
        };
        const textPart = {
            text: "Phân tích chi tiết nhân vật trong ảnh này để có thể tái tạo một cách nhất quán trong các cảnh khác nhau. Tập trung vào các đặc điểm ngoại hình, khuôn mặt, quần áo, phụ kiện và phong cách tổng thể. Trả lời bằng tiếng Việt."
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [textPart, imagePart] },
        });

        const responseText = response.text;
        if (!responseText) {
            throw new Error("Phản hồi phân tích nhân vật bị trống.");
        }
        return responseText;
    } catch (error) {
        console.error("Lỗi khi phân tích hình ảnh nhân vật:", error);
        const errorMessage = error instanceof Error ? error.message : "Không xác định";
        throw new Error(`Không thể phân tích hình ảnh nhân vật. Lỗi: ${errorMessage}`);
    }
};

export const generateImagesFromPrompt = async (
    prompt: string, 
    aspectRatio: string, 
    apiKey: string // <-- SỬA LỖI: Thêm tham số apiKey
): Promise<string[]> => {
  try {
    // SỬA LỖI: Khởi tạo 'ai' cục bộ với key được cung cấp
    if (!apiKey) throw new Error("Vui lòng nhập Gemini API Key của bạn ở đầu trang.");
    const ai = new GoogleGenAI({ apiKey });

    // ... (Phần còn lại của hàm giữ nguyên) ...
    const cleanPrompt = prompt.replace(/--ar\s+\d+:\d+/, '').trim();
    let aspectRatioDescription = '';
    switch (aspectRatio) {
      case '16:9':
        aspectRatioDescription = 'A widescreen, cinematic image with a 16:9 aspect ratio.';
        break;
      case '9:16':
        aspectRatioDescription = 'A vertical, portrait-style image with a 9:16 aspect ratio.';
        break;
      case '1:1':
        aspectRatioDescription = 'A square image with a 1:1 aspect ratio.';
        break;
      case '4:3':
        aspectRatioDescription = 'A classic image with a 4:3 aspect ratio.';
        break;
      default:
        aspectRatioDescription = `An image with an aspect ratio of ${aspectRatio}.`;
    }
    const enhancedPrompt = `${aspectRatioDescription} ${cleanPrompt}`;

    const generateSingleImage = async () => {
      // Hàm này sẽ sử dụng 'ai' đã được khởi tạo ở trên
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: enhancedPrompt }],
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
      }
      throw new Error("Không tìm thấy dữ liệu hình ảnh trong phản hồi.");
    };

    const imagePromises = [generateSingleImage(), generateSingleImage()];
    const base64Images = await Promise.all(imagePromises);

    return base64Images;
  } catch (error)
  {
    console.error("Lỗi khi tạo ảnh bằng Gemini:", error);
    const errorMessage = error instanceof Error ? error.message : "Không xác định";
    throw new Error(`Không thể tạo hình ảnh. Lỗi: ${errorMessage}`);
  }
};


export const generateScript = async (
    userInput: string, 
    mode: 'idea' | 'script', 
    stylePrompt: string, 
    characterReferences: CharacterReference[], 
    characterDefinition: string,
    aspectRatio: string,
    generateImage: boolean,
    generateMotion: boolean,
    includeMusic: boolean,
    dialogueLanguage: string,
    apiKey: string // <-- SỬA LỖI: Thêm tham số apiKey
): Promise<Script> => {
  try {
    // SỬA LỖI: Khởi tạo 'ai' cục bộ với key được cung cấp
    if (!apiKey) throw new Error("Vui lòng nhập Gemini API Key của bạn ở đầu trang.");
    const ai = new GoogleGenAI({ apiKey });
    
    // ... (Phần còn lại của hàm giữ nguyên) ...
    let instructions = "";
    if (generateImage && generateMotion) {
        instructions = "**Yêu cầu Tạo Prompt:** Tạo cả 'Prompt Tạo Ảnh' và 'Prompt Tạo Chuyển động' (chế độ tiêu chuẩn).";
    } else if (generateImage) {
        instructions = "**YỊu cầu Tạo Prompt:** CHỈ TẬP TRUNG vào việc tạo 'Prompt Tạo Ảnh'. Điền 'Không yêu cầu' vào cột 'Prompt Tạo Chuyển động'.";
    } else if (generateMotion) {
        instructions = "**Yêu cầu Tạo Prompt:** CHỈ TẬP TRUNG vào việc tạo 'Prompt Tạo Chuyển động' ở **chế độ điện ảnh** như đã mô tả trong tiêu chuẩn. Điền 'Không yêu cầu' vào cột 'Prompt Tạo Ảnh'.";
    }

    const baseSystemPrompt = mode === 'idea' ? SYSTEM_PROMPT_FROM_IDEA : SYSTEM_PROMPT_FROM_SCRIPT;
    let systemPrompt = baseSystemPrompt.replace('{{PROMPT_GENERATION_INSTRUCTIONS}}', instructions);
    
    const guidesToPrepend: string[] = [];
    const lowerCaseStylePrompt = stylePrompt.toLowerCase();

    if (lowerCaseStylePrompt.includes('photorealistic')) guidesToPrepend.push(PHOTOREALISTIC_GUIDE);
    if (lowerCaseStylePrompt.includes('anime')) guidesToPrepend.push(ANIME_GUIDE);
    if (lowerCaseStylePrompt.includes('cyberpunk')) guidesToPrepend.push(CYBERPUNK_GUIDE);
    if (lowerCaseStylePrompt.includes('fantasy')) guidesToPrepend.push(FANTASY_GUIDE);
    if (lowerCaseStylePrompt.includes('vintage')) guidesToPrepend.push(VINTAGE_GUIDE);

    if (guidesToPrepend.length > 0) {
      const combinedGuides = "**HƯỚNG DẪN BỔ SUNG VỀ CÁC PHONG CÁCH ĐÃ CHỌN:**\n" + guidesToPrepend.join('\n\n');
      systemPrompt = combinedGuides + '\n\n---\n\n' + systemPrompt;
    }

    let fullUserInput = `\n**Phong cách được chọn:** ${stylePrompt}`;
    fullUserInput += `\n**Tỉ lệ khung hình:** ${aspectRatio}`;
    fullUserInput += `\n**Bao gồm Âm nhạc:** ${includeMusic ? 'Có' : 'Không'}`;
    fullUserInput += `\n**Ngôn ngữ đối thoại:** ${dialogueLanguage}`;

    if (characterDefinition.trim()) {
      fullUserInput += `\n**Định nghĩa Nhân vật (văn bản):**\n${characterDefinition.trim()}`;
    }

    const characterDefinitions = characterReferences
      .filter(ref => ref.description.trim() !== '')
      .map(ref => `- ${ref.name}: ${ref.description.trim()}`)
      .join('\n');

    if (characterDefinitions) {
      fullUserInput += `\n**Tham Chiếu Nhân vật (hình ảnh):**\n${characterDefinitions}`;
    }

    fullUserInput += `\n\n**Nội dung yêu cầu:**\n${userInput}`;

    const contentParts: Part[] = [{ text: `${systemPrompt}\n\n**Yêu cầu của người dùng:** ${fullUserInput}` }];

    characterReferences.forEach(ref => {
      if (ref.imageBase64 && ref.fileType) {
        contentParts.push({ text: `\n[Hình ảnh tham chiếu cho nhân vật: ${ref.name}]` });
        contentParts.push({
          inlineData: {
            mimeType: ref.fileType,
            data: ref.imageBase64,
          }
        });
      }
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: { parts: contentParts },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Phản hồi từ Gemini bị trống.");
    }
    
    return parseGeminiResponse(responseText);
  } catch (error) {
    console.error("Lỗi khi gọi Gemini API:", error);
    const errorMessage = error instanceof Error ? error.message : "Không xác định";
    throw new Error(`Đã xảy ra lỗi khi tạo kịch bản. Lỗi: ${errorMessage}`);
  }
};

const STORYTELLING_SYSTEM_PROMPT = `
Bạn là một AI chuyên gia chuyển thể truyện kể thành kịch bản video. Nhiệm vụ của bạn là nhận một câu chuyện cùng các tham số, chia câu chuyện thành các phân cảnh hợp lý, và tạo ra các thành phần cần thiết cho việc sản xuất video cho mỗi cảnh.

**Quy tắc:**
- Luôn tuân thủ schema JSON được yêu cầu cho đầu ra.
- Việc phân chia thành các cảnh phải hợp lý và theo mạch truyện.
- "imagePrompt" và "motionPrompt" phải bằng TIẾNG ANH.
- "imagePrompt" phải bao gồm phong cách và tỉ lệ khung hình được cung cấp.
- "motionPrompt" phải là một chuỗi JSON hợp lệ.
- Nếu "Định nghĩa nhân vật" được cung cấp, tất cả các "imagePrompt" có chứa nhân vật BẮT BUỘC phải bao gồm **NGUYÊN VĂN VÀ ĐẦY ĐỦ** mô tả của nhân vật đó để đảm bảo tính nhất quán.
`;

export const generateStorytellingPrompts = async (
    storyScript: string,
    durationPerScene: number,
    targetLanguage: string,
    stylePrompt: string,
    aspectRatio: string,
    characterDefinition: string,
    apiKey: string // <-- SỬA LỖI: Thêm tham số apiKey
): Promise<StorytellingScene[]> => {
    let userPrompt = `
    **Dữ liệu của người dùng:**
    * **Câu chuyện:**
        \`\`\`
        ${storyScript}
        \`\`\`
    * **Thời lượng mỗi cảnh (gợi ý):** ${durationPerScene} giây
    * **Ngôn ngữ đích cho lời thoại:** ${targetLanguage}
    * **Prompt phong cách:** ${stylePrompt}
    * **Tỉ lệ khung hình:** ${aspectRatio}
    `;

    if (characterDefinition.trim()) {
        userPrompt += `\n    * **Định nghĩa nhân vật:**\n        ${characterDefinition.trim()}`;
    }

    userPrompt += `

    Hãy phân tích câu chuyện và tạo ra một mảng các phân cảnh video theo schema được yêu cầu.
    `;

    try {
        // SỬA LỖI: Khởi tạo 'ai' cục bộ với key được cung cấp
        if (!apiKey) throw new Error("Vui lòng nhập Gemini API Key của bạn ở đầu trang.");
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: [{ parts: [{ text: userPrompt }] }],
            config: {
                systemInstruction: STORYTELLING_SYSTEM_PROMPT,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    description: "Một mảng các đối tượng, mỗi đối tượng đại diện cho một phân cảnh video.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            sceneNumber: { type: Type.STRING, description: "Số thứ tự cảnh, ví dụ: 'Cảnh 1'." },
                            originalDialogue: { type: Type.STRING, description: "Đoạn văn bản gốc của cảnh này từ câu chuyện đầu vào." },
                            translatedDialogue: { type: Type.STRING, description: "Bản dịch của 'originalDialogue' sang ngôn ngữ đích được chỉ định." },
                            imageMeaning: { type: Type.STRING, description: "Mô tả ngắn gọn bằng tiếng Việt về yếu tố hình ảnh hoặc cảm xúc chính của cảnh." },
                            imagePrompt: { type: Type.STRING, description: "Prompt tạo ảnh chi tiết bằng TIẾNG ANH, bao gồm phong cách và tỉ lệ khung hình." },
                            motionPrompt: { type: Type.STRING, description: "Một chuỗi JSON hợp lệ mô tả chuyển động máy quay và hiệu ứng bằng TIẾNG ANH." },
                        },
                        required: ["sceneNumber", "originalDialogue", "translatedDialogue", "imageMeaning", "imagePrompt", "motionPrompt"]
                    }
                }
            }
        });

        const responseText = response.text;
        if (!responseText) {
            throw new Error("AI đã trả về một phản hồi trống.");
        }
        
        const result = JSON.parse(responseText);
        if (!Array.isArray(result)) {
            // This case should be rare with responseSchema, but good for safety.
            throw new Error("Phản hồi không phải là một mảng JSON như mong đợi.");
        }
        return result as StorytellingScene[];
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error("Lỗi khi tạo kịch bản kể chuyện:", e);
        // Let's not include the raw response in the user-facing error to avoid clutter, it's already in the console.
        throw new Error(`AI không thể xử lý yêu cầu. Lỗi: ${errorMessage}`);
    }
};