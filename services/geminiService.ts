import { GoogleGenAI, Part, Modality, Type, Content } from "@google/genai";
import type { Script, Scene, CharacterReference, StorytellingScene } from '../types';

// =========================================================================
// === CẬP NHẬT PROMPT ĐỊNH NGHĨA NHÂN VẬT (v10.0) ===
// =========================================================================
const CHARACTER_DEFINITION_SYSTEM_PROMPT = `Mô tả chi tiết, nhất quán, tập trung vào các yếu tố hình ảnh của các nhân vật trong truyện để dễ dàng sử dụng làm cơ sở cho prompt tạo ảnh (ví dụ: với Midjourney, Stable Diffusion hoặc DALL-E). Điều này giúp nhân vật trông giống nhau qua nhiều hình ảnh khác nhau.

Yêu cầu:
1.  **Phân tích TẤT CẢ nhân vật:** Đọc toàn bộ câu chuyện và tạo định nghĩa cho TỪNG NHÂN VẬT riêng biệt.
2.  **Tập trung vào Hình ảnh:** Ưu tiên các yếu tố hình ảnh (visual elements) để tạo prompt.
3.  **Các yếu tố BẮT BUỘC bao gồm:**
    * **Ngoại hình vật lý:** Chủng tộc, độ tuổi, Chiều cao, cân nặng, hình dáng cơ thể, màu tóc/mắt/da, đặc điểm khuôn mặt (mũi cao, má lúm, sẹo...).
    * **Trang phục và phụ kiện:** Phong cách mặc (cổ điển, hiện đại), màu sắc chính, vật dụng thường mang (kiếng, mũ, vũ khí nếu là fantasy).
    * **Biểu cảm và tư thế (Tính cách ảnh hưởng):** Tính cách ảnh hưởng đến hình ảnh (ví dụ: nhân vật vui vẻ thì cười tươi, nghiêm túc thì mặt lạnh).
    * **Yếu tố nhất quán (Key Visual Traits):** Thêm một mục "Đặc điểm nhận dạng chính" (key visual traits) để lặp lại trong prompt, ví dụ: "luôn có mái tóc đỏ dài, mắt xanh, và chiếc vòng cổ bạc".
4.  **Tránh:** Không mô tả trừu tượng (như chỉ tính cách mà không liên kết với hình ảnh).

**Yêu cầu đầu ra BẮT BUỘC:**
-   Ngôn ngữ của đầu ra phải là **Tiếng Việt**.
-   **CHỈ** trả về danh sách định nghĩa nhân vật.
-   **TUYỆT ĐỐI KHÔNG** bao gồm bất kỳ lời chào hỏi, lời giải thích, tiêu đề markdown, hay quá trình tư duy nào (KHÔNG VIẾT "Chắc chắn rồi! Dưới đây là..."!).`;


export const generateCharacterDefinition = async (
    scriptText: string, 
    apiKey: string
): Promise<string> => {
    try {
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
        const errorMessage = error instanceof Error ? error.message : "Không xác định";
        throw new Error(`Không thể tạo định nghĩa nhân vật. Lỗi: ${errorMessage}`);
    }
};

// =========================================================================
// === CẬP NHẬT PROMPT HỆ THỐNG (PHIÊN BẢN 10.0 - YÊU CẦU MỚI NHẤT) ===
// =========================================================================

const SYSTEM_PROMPT_FROM_IDEA = `
Bạn là một "Chuyên gia Viết Kịch bản và Prompt cho AI Video" sử dụng mô hình Gemini 2.5 Pro.
Nhiệm vụ của bạn là nhận ý tưởng của người dùng, phân tích và chia thành các phân cảnh, sau đó tạo ra các prompt tối ưu cho từng phân cảnh.

**TỐI HẬU THƯ VỀ NHẤT QUÁN NHÂN VẬT (TUÂN THỦ TUYỆT ĐỐI - PHIÊN BẢN 10.0)**

Nhiệm vụ quan trọng nhất của bạn là đảm bảo nhân vật nhất quán.

**1. NGUỒN DỮ LIỆU NHÂN VẬT (Nguồn Chân Lý):**
* DƯỚI ĐÂY LÀ "NGUỒN CHÂN LÝ VỀ NHÂN VẬT" MÀ BẠN PHẢI SỬ DỤNG. ĐÂY LÀ NGUỒN DUY NHẤT. NÓ ĐƯỢC VIẾT BẰNG TIẾNG VIỆT.
---
{{CHARACTER_DATA_GOES_HERE}}
---

**2. QUY TRÌNH BẮT BUỘC KHI VIẾT PROMPT ẢNH ("DỊCH, DÁN VÀ SỬA"):**
Khi bạn viết \`Prompt Tạo Ảnh\` (bắt buộc bằng **Tiếng Anh**), bạn phải tuân thủ quy trình sau cho MỌI nhân vật trong cảnh:

* **BƯỚC 1: DỊCH (TRANSLATE)**
    * TÌM mô tả của nhân vật (ví dụ: 'Haruka Sato') trong \`NGUỒN CHÂN LÝ VỀ NHÂN VẬT\` (đã cung cấp ở trên).
    * BẮT BUỘC **DỊCH NGUYÊN VĂN 100% (VERBATIM)** toàn bộ mô tả của bà ấy sang **TIẾNG ANH**, giữ lại tất cả các chi tiết (Tên, Tuổi, Tóc, Mắt, Mặt, VÀ CẢ gợi ý trang phục).

* **BƯỚC 2: DÁN (PASTE)**
    * BẮT BUỘC **DÁN (PASTE)** toàn bộ bản dịch Tiếng Anh 100% chi tiết đó (bao gồm ngoại hình, trang phục, key visual traits) vào đầu prompt. Đây là "anchor" (neo) để AI không thay đổi ngẫu nhiên.

* **BƯỚC 3: SỬA (ADAPT)**
    * NGAY SAU KHI DÁN, bạn phải đọc "Mô tả Kịch bản Chi tiết" của cảnh này.
    * BẮT BUỘC **SỬA LẠI** bản dịch vừa dán để nó khớp với bối cảnh của cảnh.
    * Cụ thể: Sửa lại **Trang phục (Clothing)**, **Hành động (Action)**, và **Biểu cảm (Expression)**, nhưng phải giữ nguyên đặc điểm Cốt lõi (tóc, mắt, mặt, vóc dáng).
    * *VÍ DỤ QUY TRÌNH:*
        * *Nguồn Chân Lý (Việt):* \`Haruka Sato: 70 tuổi, người Nhật, tóc bạc búi, mắt nâu hiền từ, nếp nhăn, trang phục thường ngày là áo chàm...\`
        * *Kịch bản Cảnh nói:* "Haruka đang mặc kimono trong phòng trà."
        * *AI thực hiện Bước 1 (Dịch):* \`Haruka Sato: 70 years old, Japanese, silver hair in a bun, kind brown eyes, wrinkles, usual attire is an indigo blouse...\`
        * *AI thực hiện Bước 2 (Dán):* (Dán toàn bộ bản dịch vào prompt)
        * *AI thực hiện Bước 3 (Sửa):* \`Haruka Sato, a 70-year-old Japanese woman, with silver-white hair in a neat bun, dark brown kindly eyes, and a face with age wrinkles, <xóa 'usual attire...'> is wearing a light brown samue (home kimono), sitting serenely...\`

* **CẢNH BÁO TỐI CAO:** Lặp lại quy trình "DỊCH, DÁN VÀ SỬA" này cho **MỌI NHÂN VẬT** được định nghĩa có mặt trong cảnh. Phải thêm các từ khóa như "consistent character", "same appearance as described", "no variations in features" để nhấn mạnh. Nếu cảnh có 3 nhân vật, tôi muốn thấy 3 MÔ TẢ ĐẦY ĐỦ ĐÃ ĐƯỢC DỊCH VÀ SỬA. Nếu bạn chỉ viết tên ('Haruka Sato'), bạn đã THẤT BẠI.

**QUY TẮC BỔ SUNG:**
* **Số lượng Phân cảnh:** Dựa trên ý tưởng được cung cấp, hãy tự quyết định số lượng phân cảnh phù hợp.
* **Phong cách:** CHỈ SỬ DỤNG phong cách đã được cung cấp (ví dụ: Photorealistic...).
* **Âm nhạc:** Nếu người dùng yêu cầu, hãy thêm một key \`"music"\` vào JSON của "Prompt Tạo Chuyển động".
* **Ngôn ngữ đối thoại:** Nếu có hội thoại, tất cả các câu thoại trong prompt phải được viết bằng ngôn ngữ do người dùng chỉ định.

{{PROMPT_GENERATION_INSTRUCTIONS}}

**Tiêu chuẩn đầu ra BẮT BUỘC:**
(Giữ nguyên các tiêu chuẩn về Bảng Phân cảnh, cấm lời chào, v.v.)
1.  **Bảng Phân cảnh:** Trình bày dưới dạng bảng Markdown. BẮT ĐẦU VỚI DÒNG "### Bảng Phân cảnh". Bảng phải có 5 cột với tiêu đề chính xác như sau: "STT/Phân cảnh", "Thời gian (8 giây)", "Mô tả Kịch bản Chi tiết", "Prompt Tạo Ảnh (Whisk AI)", "Prompt Tạo Chuyển động (Veo 3.1)".
    * **Prompt Tạo Ảnh (Whisk AI):** Prompt chi tiết bằng **TIẾNG ANH**. BẮT BUỘC tuân thủ **QUY TRÌNH BẮT BUỘC KHI VIẾT PROMPT ẢNH** ở trên.
    * **Prompt Tạo Chuyển động (Veo 3.1):** Prompt riêng biệt bằng **TIẾNG ANH**, phải là một chuỗi JSON hợp lệ.
        * Nếu có nhân vật, BẮT BUỘC phải nhúng mô tả (đã dịch và sửa) vào key \`character_definitions\` trong JSON.
`;

const SYSTEM_PROMPT_FROM_SCRIPT = `
Bạn là một "Chuyên gia Tạo Prompt cho AI Video" sử dụng mô hình Gemini 2.5 Pro.
Nhiệm vụ của bạn là nhận một kịch bản đã được chia sẵn thành các phân cảnh từ người dùng. Dựa trên mô tả của từng cảnh, bạn sẽ tạo ra các prompt tối ưu để tạo ảnh và tạo chuyển động.

**TỐI HẬU THƯ VỀ NHẤT QUÁN NHÂN VẬT (TUÂN THỦ TUYỆT ĐỐI - PHIÊN BẢN 10.0)**

Nhiệm vụ quan trọng nhất của bạn là đảm bảo nhân vật nhất quán.

**1. NGUỒN DỮ LIỆU NHÂN VẬT (Nguồn Chân Lý):**
* DƯỚI ĐÂY LÀ "NGUỒN CHÂN LÝ VỀ NHÂN VẬT" MÀ BẠN PHẢI SỬ DỤNG. ĐÂY LÀ NGUỒN DUY NHẤT. NÓ ĐƯỢC VIẾT BẰNG TIẾNG VIỆT.
---
{{CHARACTER_DATA_GOES_HERE}}
---

**2. QUY TRÌNH BẮT BUỘC KHI VIẾT PROMPT ẢNH ("DỊCH, DÁN VÀ SỬA"):**
Khi bạn viết \`Prompt Tạo Ảnh\` (bắt buộc bằng **Tiếng Anh**), bạn phải tuân thủ quy trình sau cho MỌI nhân vật trong cảnh:

* **BƯỚC 1: DỊCH (TRANSLATE)**
    * TÌM mô tả của nhân vật (ví dụ: 'Haruka Sato') trong \`NGUỒN CHÂN LÝ VỀ NHÂN VẬT\` (đã cung cấp ở trên).
    * BẮT BUỘC **DỊCH NGUYÊN VĂN 100% (VERBATIM)** toàn bộ mô tả của bà ấy sang **TIẾNG ANH**, giữ lại tất cả các chi tiết (Tên, Tuổi, Tóc, Mắt, Mặt, VÀ CẢ gợi ý trang phục).

* **BƯỚC 2: DÁN (PASTE)**
    * BẮT BUỘC **DÁN (PASTE)** toàn bộ bản dịch Tiếng Anh 100% chi tiết đó (bao gồm ngoại hình, trang phục, key visual traits) vào đầu prompt. Đây là "anchor" (neo) để AI không thay đổi ngẫu nhiên.

* **BƯỚC 3: SỬA (ADAPT)**
    * NGAY SAU KHI DÁN, bạn phải đọc "Mô tả Kịch bản Chi tiết" của cảnh này.
    * BẮT BUỘC **SỬA LẠI** bản dịch vừa dán để nó khớp với bối cảnh của cảnh.
    * Cụ thể: Sửa lại **Trang phục (Clothing)**, **Hành động (Action)**, và **Biểu cảm (Expression)**, nhưng phải giữ nguyên đặc điểm Cốt lõi (tóc, mắt, mặt, vóc dáng).
    * *VÍ DỤ QUY TRÌNH:*
        * *Nguồn Chân Lý (Việt):* \`Haruka Sato: 70 tuổi, người Nhật, tóc bạc búi, mắt nâu hiền từ, nếp nhăn, trang phục thường ngày là áo chàm...\`
        * *Kịch bản Cảnh nói:* "Haruka đang mặc kimono trong phòng trà."
        * *AI thực hiện Bước 1 (Dịch):* \`Haruka Sato: 70 years old, Japanese, silver hair in a bun, kind brown eyes, wrinkles, usual attire is an indigo blouse...\`
        * *AI thực hiện Bước 2 (Dán):* (Dán toàn bộ bản dịch vào prompt)
        * *AI thực hiện Bước 3 (Sửa):* \`Haruka Sato, a 70-year-old Japanese woman, with silver-white hair in a neat bun, dark brown kindly eyes, and a face with age wrinkles, <xóa 'usual attire...'> is wearing a light brown samue (home kimono), sitting serenely...\`

* **CẢNH BÁO TỐI CAO:** Lặp lại quy trình "DỊCH, DÁN VÀ SỬA" này cho **MỌI NHÂN VẬT** được định nghĩa có mặt trong cảnh. Phải thêm các từ khóa như "consistent character", "same appearance as described", "no variations in features" để nhấn mạnh. Nếu cảnh có 3 nhân vật, tôi muốn thấy 3 MÔ TẢ ĐẦY ĐỦ ĐÃ ĐƯỢC DỊCH VÀ SỬA. Nếu bạn chỉ viết tên ('Haruka Sato'), bạn đã THẤT BẠI.

**QUY TẮC BỔ SUNG:**
* **Quy tắc Phân cảnh (QUAN TRỌNG NHẤT):** Kịch bản của người dùng đã được chia thành nhiều chương (\`--- BẮT ĐẦU CHƯƠNG X ---\`). Nhiệm vụ của bạn là tạo ra **CHÍNH XÁC MỘT PHÂN CẢNH** cho **MỖI CHƯƠNG**. Số lượng phân cảnh trong bảng kết quả cuối cùng phải BẰNG ĐÚNG số lượng chương.
* **Phong cách:** CHỈ SỬ DỤNG phong cách đã được cung cấp (ví dụ: Photorealistic...).
* **Âm nhạc:** Nếu người dùng yêu cầu, hãy thêm một key \`"music"\` vào JSON của "Prompt Tạo Chuyển động".
* **Ngôn ngữ đối thoại:** Nếu có hội thoại, tất cả các câu thoại trong prompt phải được viết bằng ngôn ngữ do người dùng chỉ định.

{{PROMPT_GENERATION_INSTRUCTIONS}}

**YÊU CẦU ĐỊNH DẠNG ĐẦU RA (TUYỆT ĐỐI NGHIÊM NGẶT):**

1.  **ĐIỂM BẮT ĐẦU BẮT BUỘC:** Phản hồi của bạn PHẢI BẮT ĐẦU bằng dòng chữ \`### Bảng Phân cảnh\`.
2.  **CẤM TUYỆT ĐỐI:** KHÔNG được có bất kỳ văn bản, lời chào, hay lời giải thích nào (như "Chắc chắn rồi!...") TRƯỚC dòng \`### Bảng Phân cảnh\`.
3.  **ĐỊNH DẠNG BẢNG:** NGAY SAU dòng đó, hãy cung cấp một bảng Markdown 5 cột DUY NHẤT. Tiêu đề cột BẮT BUỘC phải chính xác như sau:
    | STT/Phân cảnh | Thời gian (8 giây) | Mô tả Kịch bản Chi tiết | Prompt Tạo Ảnh (Whisk AI) | Prompt Tạo Chuyển động (Veo 3.1) |
4.  **QUY TẮC MỘT-MỘT:** Mỗi 'Chương' trong đầu vào của người dùng phải tương ứng với CHÍNH XÁC MỘT HÀNG trong bảng này.

**TUÂN THỦ CẤU TRÚC PROMPT ẢNH (BẮT BUỘC):**
* **Prompt Tạo Ảnh (Whisk AI):** Dựa vào mô tả, tạo một prompt chi tiết bằng **TIẾNG ANH**. BẮT BUỘC tuân thủ **QUY TRÌNH BẮT BUỘC KHI VIẾT PROMPT ẢNH** ở trên.
* **Prompt Tạo Chuyển động (Veo 3.1):** Prompt riêng biệt bằng **TIẾNG ANH**, phải là một chuỗi JSON hợp lệ.
    * Nếu có nhân vật, BẮT BUỘC phải nhúng mô tả (đã dịch và sửa) vào key \`character_definitions\` trong JSON.
`;

// --- CÁC HƯỚNG DẪN PHONG CÁCH ---
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

// --- CÁC HÀM HELPERS (GIỮ NGUYÊN) ---
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
    apiKey: string
): Promise<string> => {
    try {
        if (!apiKey) throw new Error("Vui lòng nhập Gemini API Key của bạn ở đầu trang.");
        const ai = new GoogleGenAI({ apiKey });

        const imagePart = {
            inlineData: { data: base64Image, mimeType },
        };
        
        const textPart = {
            text: "Phân tích chi tiết nhân vật trong ảnh này để tái tạo nhất quán. Tập trung vào các đặc điểm ngoại hình, khuôn mặt, quần áo, phụ kiện, phong cách tổng thể. Yêu cầu đầu ra: Chỉ trả về văn bản mô tả chi tiết bằng tiếng Việt, KHÔNG BAO GIỜ bao gồm bất kỳ lời chào, lời mở đầu hay câu dẫn nào (như 'Chắc chắn rồi!' hoặc 'Dưới đây là...'). Chỉ trả về phần mô tả."
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [textPart, imagePart] },
        });

        const responseText = response.text;
        if (!responseText) {
            throw new Error("Phản hồi phân tích nhân vật bị trống.");
        }
        return responseText.trim();
    } catch (error) {
        console.error("Lỗi khi phân tích hình ảnh nhân vật:", error);
        const errorMessage = error instanceof Error ? error.message : "Không xác định";
        throw new Error(`Không thể phân tích hình ảnh nhân vật. Lỗi: ${errorMessage}`);
    }
};

export const generateImagesFromPrompt = async (
    prompt: string, 
    aspectRatio: string, 
    apiKey: string
): Promise<string[]> => {
  try {
    if (!apiKey) throw new Error("Vui lòng nhập Gemini API Key của bạn ở đầu trang.");
    const ai = new GoogleGenAI({ apiKey });

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
    characterDefinition: string, // <-- Đây là ô to
    aspectRatio: string,
    generateImage: boolean,
    generateMotion: boolean,
    includeMusic: boolean,
    dialogueLanguage: string,
    apiKey: string,
    characterSource: 'definition' | 'references', // <-- THAM SỐ MỚI TỪ CHECKBOX
    limitCharacterCount: boolean = false // <--- THAM SỐ MỚI CẬP NHẬT: GIỚI HẠN NHÂN VẬT
): Promise<Script> => {
  try {
    if (!apiKey) throw new Error("Vui lòng nhập Gemini API Key của bạn ở đầu trang.");
    const ai = new GoogleGenAI({ apiKey });
    
    let instructions = "";
    if (generateImage && generateMotion) {
        instructions = "**Yêu cầu Tạo Prompt:** Tạo cả 'Prompt Tạo Ảnh' và 'Prompt Tạo Chuyển động' (chế độ tiêu chuẩn).";
    } else if (generateImage) {
        instructions = "**Yêu cầu Tạo Prompt:** CHỈ TẬP TRUNG vào việc tạo 'Prompt Tạo Ảnh'. Điền 'Không yêu cầu' vào cột 'Prompt Tạo Chuyển động'.";
    } else if (generateMotion) {
        instructions = "**Yêu cầu Tạo Prompt:** CHỈ TẬP TRUNG vào việc tạo 'Prompt Tạo Chuyển động' ở **chế độ điện ảnh** như đã mô tả trong tiêu chuẩn. Điền 'Không yêu cầu' vào cột 'Prompt Tạo Ảnh'.";
    }

    // --- LOGIC XỬ LÝ GIỚI HẠN 3 NHÂN VẬT ---
    if (limitCharacterCount) {
        instructions += "\n\n**YÊU CẦU ĐẶC BIỆT:** Trong trường 'imagePrompt', bạn CHỈ ĐƯỢC PHÉP mô tả TỐI ĐA 3 NHÂN VẬT CHÍNH quan trọng nhất xuất hiện trong cảnh đó. Ngay cả khi cốt truyện gốc có nhiều nhân vật hơn, hãy lọc và chỉ giữ lại mô tả của 3 người quan trọng nhất để tránh làm rối AI tạo ảnh. Bỏ qua mô tả ngoại hình của các nhân vật quần chúng hoặc phụ.";
    }
    // ----------------------------------------

    const baseSystemPrompt = mode === 'idea' ? SYSTEM_PROMPT_FROM_IDEA : SYSTEM_PROMPT_FROM_SCRIPT;
    
    // --- LOGIC MỚI: CHỌN 1 TRONG 2 DỰA TRÊN CHECKBOX ---
    let finalCharacterDefinition = "";
    
    if (characterSource === 'references') {
      // ƯU TIÊN 1: Dùng các ô nhỏ
      const characterRefsList = characterReferences
        .filter(ref => ref.description.trim() !== '')
        .map(ref => `- ${ref.name}: ${ref.description.trim()}`);

      if (characterRefsList.length > 0) {
        finalCharacterDefinition = characterRefsList.join('\n');
      } else {
        finalCharacterDefinition = "Trống (Đã chọn Tham chiếu nhân vật nhưng không có mô tả).";
      }
    } else {
      // ƯU TIÊN 2 (mặc định): Dùng ô to
      if (characterDefinition.trim()) {
        finalCharacterDefinition = characterDefinition.trim();
      } else {
        finalCharacterDefinition = "Trống (Đã chọn Định nghĩa nhân vật nhưng không có mô tả).";
      }
    }
    // --- KẾT THÚC LOGIC MỚI ---
    
    
    // --- LOGIC MỚI: INJECT VÀO SYSTEM PROMPT ---
    let systemPrompt = baseSystemPrompt.replace('{{PROMPT_GENERATION_INSTRUCTIONS}}', instructions);
    // Đây là bước "tiêm" Nguồn Chân Lý vào thẳng System Prompt
    systemPrompt = systemPrompt.replace('{{CHARACTER_DATA_GOES_HERE}}', finalCharacterDefinition); 
    
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

    // Phần User Input bây giờ sẽ gọn gàng hơn
    let fullUserInput = `\n**Phong cách được chọn:** ${stylePrompt}`;
    fullUserInput += `\n**Tỉ lệ khung hình:** ${aspectRatio}`;
    fullUserInput += `\n**Bao gồm Âm nhạc:** ${includeMusic ? 'Có' : 'Không'}`;
    fullUserInput += `\n**Ngôn ngữ đối thoại:** ${dialogueLanguage}`;
    
    // Chúng ta không cần gửi Nguồn Chân Lý ở đây nữa.
    
    fullUserInput += `\n\n**Nội dung yêu cầu:**\n${userInput}`;

    const contentParts: Part[] = [{ text: `${systemPrompt}\n\n**Yêu cầu của người dùng:** ${fullUserInput}` }];

    // Vẫn gửi hình ảnh tham chiếu (nếu có) để AI "nhìn" (giúp ích cho việc Phân tích bằng AI)
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
    apiKey: string
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

// =========================================================================
// === HÀM MỚI: REGENERATE CẢ ẢNH VÀ CHUYỂN ĐỘNG ===
// =========================================================================
export const regenerateScenePrompts = async ( // Đổi tên hàm cho đúng ý nghĩa
  sceneDescription: string,
  characterData: string, // Nguồn chân lý
  stylePrompt: string,
  aspectRatio: string,
  apiKey: string
): Promise<{ imagePrompt: string; motionPrompt: string }> => { // Trả về Object
  try {
    if (!apiKey) throw new Error("Vui lòng nhập Gemini API Key.");
    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `
    Bạn là một chuyên gia sửa lỗi Prompt AI. Nhiệm vụ của bạn là VIẾT LẠI cả "Prompt Tạo Ảnh" và "Prompt Tạo Chuyển động" cho một cảnh quay cụ thể, đảm bảo chúng khớp nhau hoàn hảo và nhân vật nhất quán.
    
    **NGUỒN DỮ LIỆU NHÂN VẬT (NGUỒN CHÂN LÝ):**
    ${characterData}
    
    **QUY TẮC BẮT BUỘC CHO PROMPT ẢNH (DỊCH, DÁN VÀ SỬA):**
    1.  **TÌM:** Tìm nhân vật trong Nguồn Chân Lý.
    2.  **DỊCH & DÁN:** Dịch nguyên văn 100% mô tả cốt lõi (Tên, Tuổi, Tóc, Mắt, Mặt...) sang Tiếng Anh và DÁN vào đầu prompt ảnh.
    3.  **SỬA:** Dựa vào "Mô tả Cảnh", sửa lại Trang phục, Hành động, Biểu cảm cho phù hợp.

    **QUY TẮC CHO PROMPT CHUYỂN ĐỘNG:**
    - Phải logic với Prompt Ảnh vừa tạo.
    - Phải là một chuỗi JSON hợp lệ mô tả camera và hành động (Veo 3.1 format).

    **INPUT:**
    - Mô tả Cảnh: ${sceneDescription}
    - Phong cách: ${stylePrompt}
    - Tỉ lệ: ${aspectRatio}
    
    **OUTPUT JSON FORMAT (BẮT BUỘC):**
    Chỉ trả về đúng định dạng JSON này, không thêm văn bản khác:
    {
      "imagePrompt": "Nội dung prompt ảnh tiếng Anh...",
      "motionPrompt": "Nội dung prompt chuyển động (dạng JSON string hoặc text mô tả)..."
    }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: [{ parts: [{ text: systemPrompt }] }],
      config: { responseMimeType: "application/json" } // Ép kiểu JSON để AI trả về đúng
    });

    const responseText = response.text;
    if (!responseText) throw new Error("Phản hồi trống.");
    
    // Parse JSON
    const result = JSON.parse(responseText);
    return {
        imagePrompt: result.imagePrompt || "",
        motionPrompt: result.motionPrompt || ""
    };

  } catch (error) {
    console.error("Lỗi khi tạo lại prompt:", error);
    throw new Error("Không thể tạo lại prompt.");
  }
};