
import { GoogleGenAI } from "@google/genai";
import type { Script, Scene } from '../types';

const SYSTEM_INSTRUCTION = `Bạn là một AI chuyên gia tạo kịch bản và prompt hình ảnh.

**QUY TẮC TỐI THƯỢỢNG:**
BẠN SẼ NHẬN ĐƯỢC MỘT DANH SÁCH CÁC CHƯƠNG TRUYỆN. BẠN PHẢI TẠO RA MỘT BẢNG MARKDOWN HOÀN CHỈNH, VỚI MỖI HÀNG TRONG BẢNG TƯƠNG ỨNG VỚI MỘT CHƯƠNG.

---

### QUY TRÌNH LÀM VIỆC

1.  **Phân tích:** Đọc kỹ TẤT CẢ các chương truyện và các tùy chọn được cung cấp để hiểu toàn bộ bối cảnh.
2.  **Tạo Bảng:** Với MỖI chương, tạo ra MỘT hàng tương ứng trong bảng markdown.
    *   Đảm bảo STT (Số thứ tự) của các phân cảnh phải liên tục.

    | STT/Phân cảnh | Mô tả Kịch bản | Prompt Tạo Ảnh | Prompt Tạo Chuyện động |
    | :--- | :--- | :--- | :--- |
    | [STT 1] | [Mô tả cho Chương 1] | [Prompt cho Chương 1] | [Prompt cho Chương 1] |
    | [STT 2] | [Mô tả cho Chương 2] | [Prompt cho Chương 2] | [Prompt cho Chương 2] |
    | ... | ... | ... | ... |

3.  **Tạo "Prompt Tạo Ảnh" (Nếu được yêu cầu):**
    *   **QUY TẮC CỐT LÕI (SFW - An toàn cho công việc):** BẠN PHẢI TUÂN THỦ NGHIÊM NGẶT CÁC QUY TẮC SAU ĐỂ ĐẢM BẢO HÌNH ẢNH AN TOÀN.
        *   **Nguyên tắc 1: Không bạo lực trực tiếp (No Gore/Explicit Violence).**
            *   **Tránh:** Blood (máu), Wound (vết thương hở), Kill (giết), Weapon aiming at head (chĩa súng vào đầu), Strangling (bóp cổ), Torture (tra tấn).
            *   **Thay thế bằng:** Injured (bị thương), Bandages (băng gạt), Distressed (đau khổ), Intense conflict (xung đột dữ dội), Threatening pose (tư thế đe dọa).
        *   **Nguyên tắc 2: Không gợi dục/Khiêu dâm (No NSFW/Sexual Content).**
            *   **Tránh:** Nude/Naked (khỏa thân), Cleavage (khe ngực), Upskirt, Obscene (tục tĩu), Leering (nhìn đểu/dâm), Touching breast/crotch (chạm ngực/vùng kín), Seductive (gợi tình quá mức).
            *   **Thay thế bằng:** Alluring (cuốn hút), Elegant (thanh lịch), Fashionable (thời trang), Romantic embrace (ôm lãng mạn), Intense gaze (ánh nhìn mãnh liệt).
        *   **Nguyên tắc 3: Thay hành động bằng "Bầu không khí" (Atmosphere over Action).**
            *   Thay vì mô tả chi tiết hành động nhạy cảm (ví dụ: đưa hối lộ), hãy mô tả biểu cảm và ánh sáng để gợi lên cảm giác đó.
            *   Tránh mô tả y tế quá kỹ: Thay vì "bệnh nhân đang hấp hối, dây dợ chằng chịt", hãy tả "Bệnh nhân nằm trên giường bệnh, sắc mặt nhợt nhạt, không khí u buồn".
        *   **Lưu ý quan trọng về trang phục:** Luôn mô tả trang phục rõ ràng (ví dụ: "wearing a suit", "wearing a dress"). Nếu không mô tả, AI có thể "quên" vẽ quần áo, dẫn đến ảnh bị cấm.

    *   **Chọn Khoảnh Khắc:** Với mỗi chương, chọn MỘT khoảnh khắc/hình ảnh TĨNH (snapshot) đắt giá nhất, giàu cảm xúc nhất. KHÔNG tóm tắt hay kể lại nhiều sự kiện.
    *   **Cột "Mô tả Kịch bản":** Viết mô tả bằng **Tiếng Việt** cho "snapshot" đã chọn. Cuối mô tả, liệt kê tên các nhân vật có trong ảnh, đặt trong dấu ngoặc đơn. Ví dụ: (Nhân vật A, Nhân vật B).
    *   **Cột "Prompt Tạo Ảnh":** Viết prompt **Tiếng Anh** CỰC KỲ CHI TIẾT theo quy trình "Dịch, Dán, Sửa" để đảm bảo nhân vật nhất quán.
        1.  **Dịch & Dán:** Dịch nguyên văn mô tả nhân vật từ "Định nghĩa nhân vật" sang Tiếng Anh và dán vào ĐẦU prompt.
        2.  **Sửa & Bổ sung:** Chỉnh sửa, bổ sung trang phục, hành động, biểu cảm của nhân vật để khớp với "snapshot". Thêm chi tiết về bối cảnh, ánh sáng, góc máy, không khí, và các yêu cầu kỹ thuật (tỉ lệ, phong cách).
    *   **Giới hạn Dreamina:** Nếu tùy chọn "Tối ưu cho Dreamina" được bật, prompt TUYỆT ĐỐI KHÔNG VƯỢT QUÁ 1600 KÝ TỰ.

4.  **KHÔNG tạo "Prompt Tạo Ảnh" (Nếu không được yêu cầu):**
    *   **Cột "Mô tả Kịch bản":** Tóm tắt toàn bộ diễn biến trong chương bằng Tiếng Việt.
    *   **Cột "Prompt Tạo Ảnh":** Để trống.

5.  **Tạo "Prompt Tạo Chuyển động" (Nếu được yêu cầu):**
    *   **Vai trò:** Bạn là một đạo diễn hình ảnh và kỹ thuật viên kỹ xảo chuyên nghiệp.
    *   **Ngôn ngữ:** Toàn bộ prompt phải bằng **Tiếng Anh**.
    *   **Định dạng:** Luôn trả về một chuỗi **JSON** hợp lệ. KHÔNG sử dụng markdown code block.
    *   **Cấu trúc JSON bắt buộc:**
        {
          "character_definitions": "Dịch nguyên văn mô tả nhân vật từ 'Định nghĩa nhân vật' sang Tiếng Anh và dán vào đây.",
          "action_description": "Mô tả hành động đang diễn ra, lồng ghép lời thoại và khẩu hình.",
          "camera_movement": "Mô tả kỹ thuật máy quay điện ảnh phức tạp.",
          "sound_effects": "Mô tả tiếng động môi trường thực tế (SFX).",
          "bgm_mood": "Mô tả nhạc nền (BGM) nếu được yêu cầu, nếu không thì để trống.",
          "strength": "Độ mạnh của chuyển động. Chọn 'High' hoặc 'Normal'."
        }
    *   **QUY TẮC CHI TIẾT:**
        1.  **Nền tảng:** Prompt chuyển động phải làm cho khung cảnh TĨNH được mô tả trong "Prompt Tạo Ảnh" trở nên sống động. Nó phải mô tả những gì xảy ra ngay trước, trong, và sau khoảnh khắc tĩnh đó, tạo ra một video ngắn liền mạch.
        2.  **Nhất quán Nhân vật:** Luôn dịch và dán định nghĩa nhân vật vào \`"character_definitions"\` để đảm bảo tính nhất quán.
        3.  **Lời thoại & Khẩu hình:**
            *   Phải trích xuất lời thoại quan trọng từ chương truyện.
            *   Lời thoại phải được viết bằng ngôn ngữ mà người dùng đã chọn trong mục "Ngôn ngữ đối thoại".
            *   Lồng ghép lời thoại trực tiếp vào \`"action_description"\`, mô tả rõ khẩu hình (lip-sync) và cảm xúc khi nói. Ví dụ: "...his lips moving precisely to say '[lời thoại ở đây]', his voice filled with anger."
        4.  **Chuyển động (Action over Status):**
            *   TUYỆT ĐỐI KHÔNG tả trạng thái (VD: "nhân vật buồn"). PHẢI tả hành động (VD: "nhân vật gục đầu xuống, hai vai run rẩy, nước mắt rơi lã chã").
            *   Mô tả hành động đang diễn tiến, không chỉ là tư thế đứng. Ví dụ: "nhân vật vừa chạy vừa ngoái nhìn lại phía sau đầy sợ hãi".
        5.  **Máy quay (Camera Dynamics):**
            *   Sử dụng các thuật ngữ điện ảnh cho \`"camera_movement"\`. Tránh các mô tả tĩnh.
            *   Ví dụ: \`Tracking Shot following the character\`, \`Dolly Zoom to create a dramatic effect\`, \`Orbital Shot around the couple\`.
        6.  **Âm thanh (Audio Layering):**
            *   \`"sound_effects"\`: Bắt buộc phải có ít nhất 1-2 tiếng động môi trường thực tế (SFX).
            *   \`"bgm_mood"\`: CHỈ điền mô tả nhạc nền nếu người dùng chọn "Âm nhạc: Có". Nếu người dùng chọn "Âm nhạc: Không", PHẢI để trống chuỗi (\`""\`).
        7.  **Thời lượng:** Ngầm định thời lượng chuyển động là khoảng 8 giây.

6.  **KHÔNG tạo "Prompt Tạo Chuyển động" (Nếu không được yêu cầu):** BẮT BUỘC để trống cột "Prompt Tạo Chuyển động".

7.  **Đầu ra:** Toàn bộ phản hồi của bạn BẮT BUỘC chỉ được chứa duy nhất bảng markdown. KHÔNG thêm bất kỳ lời chào hay giải thích nào.`;

const CHARACTER_DEFINITION_SYSTEM_INSTRUCTION = `Mô tả các nhân vật trong truyện để làm cơ sở cho prompt tạo ảnh.

**QUY TẮC TUYỆT ĐỐI:**
1.  **CỰC KỲ CHI TIẾT & TRỰC QUAN:** Viết mô tả chi tiết, tập trung vào các đặc điểm hình thể có thể nhìn thấy được.
2.  **CÁC YẾU TỐ BẮT BUỘC:** Mỗi mô tả nhân vật PHẢI bao gồm các thông tin sau nếu có trong truyện, hoặc suy luận hợp lý từ bối cảnh:
    - **Cơ bản:** Tên, Giới tính, Chủng tộc, Độ tuổi.
    - **Hình thể:** Chiều cao, Cân nặng, Hình dáng cơ thể (ví dụ: mảnh khảnh, cơ bắp, mập mạp).
    - **Chi tiết:** Màu tóc, Màu mắt, Màu da.
    - **Đặc điểm khuôn mặt:** Các nét đặc trưng như mũi cao, má lúm, cằm chẻ, có sẹo, tàn nhang...
    - **Trang phục:** Mô tả trang phục cụ thể nếu được nhắc đến.
3.  **KHÔNG SUY DIỄN CẢM XÚC/TÍNH CÁCH:** Chỉ mô tả những gì MẮT THẤY. TUYỆT ĐỐI KHÔNG dùng các từ mơ hồ, phỏng đoán về cảm xúc, tính cách (ví dụ: "có vẻ", "toát lên", "phản ánh").
4.  **ĐỊNH DẠNG ĐOẠN VĂN:** Viết thành một đoạn văn liền mạch cho mỗi nhân vật. KHÔNG DÙNG gạch đầu dòng.

**YÊU CẦU ĐẦU RA BẮT BUỘC:**
- Ngôn ngữ: Tiếng Việt.
- CHỈ trả về danh sách định nghĩa nhân vật.
- KHÔNG bao gồm lời chào, lời giải thích, tiêu đề markdown.

---
**VÍ DỤ CỤ THỂ (BẮT BUỘC LÀM THEO):**

**VÍ DỤ 1:**
*   **KHÔNG NÊN VIẾT:** Gloria Thompson... Bà **thường** mặc trang phục cổ điển... **Dù mệt mỏi, bà vẫn giữ được một tư thế thẳng và ánh mắt kiên định.**
*   **BẠN PHẢI VIẾT:** Gloria Thompson, Nữ giới, Người Mỹ gốc Phi, 65 tuổi. Cao khoảng 1m65, nặng 70kg, dáng người đĩnh đạc. Da sẫm màu, mắt nâu sẫm, tóc muối tiêu được bới gọn gàng. Có nếp nhăn quanh mắt. Mặc áo khoác blazer màu xanh navy lịch sự.

**VÍ DỤ 2:**
*   **KHÔNG NÊN VIẾT:** Keisha Thompson... Nét mặt của bà **thường mang vẻ kịch tính**... Trang phục của bà **có lẽ cũng thể hiện** sự quan tâm đến thương hiệu...
*   **BẠN PHẢI VIẾT:** Keisha Thompson, Nữ giới, Người Mỹ gốc Phi, 42 tuổi. Cao 1m70, nặng 65kg, thân hình cân đối. Da sẫm màu, mắt đen, tóc đen dài óng ả. Lớp trang điểm đậm, được chăm chút kỹ lưỡng.

**VÍ DỤ 3:**
*   **KHÔNG NÊN VIẾT:** Tyrone Thompson... **luôn trong tư thế bồn chồn như một chiếc lò xo bị nén**... **Ánh mắt anh liên tục đảo quanh**...
*   **BẠN PHẢI VIẾT:** Tyrone Thompson, Nam giới, Người Mỹ gốc Phi, 40 tuổi. Cao 1m80, nặng 85kg, vóc dáng cơ bắp, săn chắc. Da ngăm đen, mắt nâu, đầu cạo trọc. Có một vết sẹo nhỏ trên lông mày trái. Anh mặc một chiếc áo sơ mi tối màu không che hết được những hình xăm vươn lên cổ.`;


const parseGeminiResponse = (responseText: string): Script => {
  try {
    if (!responseText.includes('|')) throw new Error("AI đã không tạo được bảng phân cảnh đúng định dạng. Vui lòng thử lại.");

    const rows = responseText.trim().split('\n').filter(row => row.includes('|') && !row.includes('---'));
    const dataRows = rows.slice(1); // Bỏ qua header của bảng

    if (dataRows.length === 0) {
        throw new Error("AI đã trả về một bảng trống. Vui lòng kiểm tra lại đầu vào hoặc thử lại.");
    }

    const scenes: Scene[] = dataRows.map((row, index) => {
      const columns = row.split('|').map(cell => cell.trim().replace(/<br\s*\/?>/gi, '\n')).filter(c => c !== ''); 
      if (columns.length < 3) return null;
      return {
        sceneNumber: columns[0] || `Cảnh ${index + 1}`,
        description: columns[1] || '',
        imagePrompt: columns[2] || '',
        motionPrompt: columns.length > 3 ? columns[3] : '',
      };
    }).filter((scene): scene is Scene => scene !== null);

    return { scenes };
  } catch (error) {
    console.error("Parse Error:", error);
     if (error instanceof Error) {
        throw error;
    }
    throw new Error("Phản hồi của AI có cấu trúc không hợp lệ và không thể xử lý. Vui lòng thử lại.");
  }
};

export const generateCharacterDefinition = async (ai: GoogleGenAI, storyText: string, modelName: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: [{ parts: [{ text: storyText }] }],
            config: { systemInstruction: CHARACTER_DEFINITION_SYSTEM_INSTRUCTION }
        });
        return response.text || "";
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Lỗi định nghĩa nhân vật.");
    }
};

export const generateImagesFromPrompt = async (ai: GoogleGenAI, prompt: string, aspectRatio: string): Promise<string[]> => {
    try {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: prompt }] },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9"
            }
          },
      });
      return response.candidates?.[0]?.content?.parts
        .filter(p => p.inlineData)
        .map(p => p.inlineData!.data) || [];
    } catch(e) {
      console.error(e);
      throw new Error("Lỗi tạo ảnh. Vui lòng kiểm tra prompt hoặc thử lại.");
    }
};

const REGENERATE_IMAGE_PROMPT_SYSTEM_INSTRUCTION = `Bạn là một AI chuyên gia tạo prompt hình ảnh. Nhiệm vụ của bạn là đọc một mô tả kịch bản và các thông tin bối cảnh, sau đó tạo ra MỘT prompt hình ảnh (Image Prompt) DUY NHẤT bằng Tiếng Anh, CỰC KỲ chi tiết.
Hãy tuân thủ nghiêm ngặt các quy tắc đã được cung cấp trong [QUY TRÌNH "HỌA SĨ" - TẠO PROMPT ẢNH CHI TIẾT] được gửi kèm trong tin nhắn của người dùng.
Phản hồi của bạn CHỈ được chứa duy nhất prompt Tiếng Anh đó. KHÔNG thêm bất kỳ lời chào, giải thích, hay markdown nào.`;

export const regenerateImagePrompt = async (
    ai: GoogleGenAI,
    sceneDescription: string,
    characterDefinition: string, 
    stylePrompt: string, 
    aspectRatio: string,
    generateWhisk: boolean,
    generateDreamina: boolean,
    modelName: string
): Promise<string> => {
    
    const context = `
[YÊU CẦU ĐẶC BIỆT]: Tạo lại MỘT "Prompt Tạo Ảnh" cho phân cảnh sau.
Mô tả kịch bản của phân cảnh: "${sceneDescription}"
---
[THÔNG TIN BỐI CẢNH ĐỂ TẠO PROMPT]

${SYSTEM_INSTRUCTION} 
---
[YÊU CẦU MỚI]
Tỉ lệ khung hình: ${aspectRatio}
Định nghĩa nhân vật: 
\`\`\`
${characterDefinition}
\`\`\`
Phong cách: ${stylePrompt}
- Tối ưu cho Whisk (tối đa 3 nhân vật): ${generateWhisk ? 'Có' : 'Không'}
- Tối ưu cho Dreamina (prompt dài 1600 ký tự): ${generateDreamina ? 'Có' : 'Không'}
---
Nhiệm vụ: Tạo ra một prompt Tiếng Anh duy nhất dựa trên các thông tin trên. Phản hồi của bạn chỉ chứa prompt đó, không có gì khác.
    `.trim();

    const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ parts: [{ text: context }] }],
        config: { systemInstruction: REGENERATE_IMAGE_PROMPT_SYSTEM_INSTRUCTION }
    });
    return response.text?.trim() || "";
};

export const generateScript = async (
    ai: GoogleGenAI,
    modelName: string,
    userInput: string, 
    mode: 'idea' | 'script', 
    stylePrompt: string, 
    characterDefinition: string, 
    aspectRatio: string, 
    generateImage: boolean, 
    generateMotion: boolean,
    generateWhisk: boolean,
    generateDreamina: boolean,
    includeMusic: boolean, 
    dialogueLanguage: string
): Promise<Script> => {
    
    const styleGuides: { [key: string]: string } = {
      photorealistic: `
### Phong cách: Photorealistic
- **Mục tiêu**: Tạo ảnh giống hệt ảnh chụp từ máy ảnh chuyên nghiệp, tập trung vào tính chân thực, chi tiết cao, và tuân thủ quy luật vật lý (ánh sáng, bóng đổ, tỷ lệ).
- **Đặc điểm**: Yêu cầu độ phân giải cao (8K, 4K), chi tiết sắc nét (detailed skin texture), ánh sáng tự nhiên (natural lighting, soft shadows), màu sắc trung thực, và chất lượng kỹ thuật cao (sharp focus, HDR).
- **Cấu trúc Prompt**: [Góc nhìn & khung cảnh], [Chủ đề chi tiết], photorealistic rendering, like a professional DSLR photo, [Ánh sáng & môi trường], [Kết cấu & chi tiết vật lý], [Chất lượng kỹ thuật], in the style of [Tham chiếu thực tế].
- **Ví dụ**: "Photorealistic portrait of a middle-aged Asian man, detailed wrinkles and beard, soft studio lighting, 8K ultra-realistic."
`,
      anime: `
### Phong cách: Anime
- **Mục tiêu**: Tạo ảnh theo phong cách hoạt hình Nhật Bản với đặc trưng phóng đại, màu sắc rực rỡ và biểu cảm cảm xúc mạnh mẽ. Ưu tiên tính nghệ thuật hơn tính chân thực.
- **Đặc điểm**: Mắt to lấp lánh, tóc đa dạng màu sắc, màu sắc sống động (vibrant colors), shading cel-shaded, dòng nét sạch sẽ (clean lines).
- **Cấu trúc Prompt**: [mô tả chủ đề] in anime style, [đặc điểm nhân vật], [màu sắc và ánh sáng], [nền và hiệu ứng], highly detailed, vibrant colors, [resolution].
- **Ví dụ**: "Epic anime scene of a warrior boy fighting a dragon, shonen style, muscular build, fiery aura, dramatic lighting with lens flare, fantasy landscape, 4K, highly detailed."
`,
      cyberpunk: `
### Phong cách: Cyberpunk
- **Mục tiêu**: Tạo ảnh bối cảnh tương lai dystopian công nghệ cao nhưng xã hội thấp kém (high-tech, low-life), với cảm giác hỗn loạn, bụi bặm và ngập tràn ánh đèn neon.
- **Đặc điểm**: Thành phố khổng lồ (megacities) với mưa, biển quảng cáo neon, thiết bị cấy ghép cơ thể (cybernetic enhancements), màu neon sáng rực (hồng, xanh dương) tương phản với bóng tối.
- **Cấu trúc Prompt**: [Chủ đề chính], [Bối cảnh Cyberpunk], [Chi tiết hình ảnh], [Ánh sáng và màu sắc], in the style of Blade Runner, cyberpunk aesthetic, [Chất lượng kỹ thuật].
- **Ví dụ**: "Portrait of a cyberpunk samurai with glowing red eyes and mechanical arms, standing in a crowded Tokyo-inspired megacity, holographic billboards, blue and purple neon glow, gritty textures, cinematic lighting, ultra-detailed."
`,
      fantasy: `
### Phong cách: Fantasy
- **Mục tiêu**: Tạo ảnh lấy cảm hứng từ thế giới tưởng tượng, bao gồm các yếu tố huyền bí, phép thuật, sinh vật huyền thoại và bối cảnh siêu nhiên.
- **Đặc điểm**: Rồng, pháp sư, tiên, lâu đài bay, rừng phép thuật, ánh sáng huyền bí (mystical lighting, ethereal glow), màu sắc sống động.
- **Cấu trúc Prompt**: [Chủ đề chính], [Phong cách Fantasy], [Chi tiết huyền ảo], [Ánh sáng/Màu sắc], [Góc nhìn/Chất lượng].
- **Ví dụ**: "Dark fantasy portrait of an elf archer in an ancient enchanted forest, glowing runes on bow, eerie moonlight filtering through leaves, intricate details on armor, cinematic composition, 8K resolution."
`,
      vintage: `
### Phong cách: Vintage
- **Mục tiêu**: Tạo ảnh lấy cảm hứng từ các thời kỳ quá khứ (cuối thế kỷ 19 đến giữa thế kỷ 20), nhấn mạnh vào sự hoài cổ và các yếu tố đại diện cho một era cụ thể.
- **Đặc điểm**: Màu sắc phai nhạt (muted colors), earthy tones, kết cấu cũ (aged textures, grainy, faded), phong cách Art Deco (hình học đối xứng) hoặc Mid-Century Modern.
- **Cấu trúc Prompt**: [Chủ đề] in vintage [era/substyle] style, with [màu sắc], [kết cấu], [yếu tố thiết kế], high detail, nostalgic atmosphere.
- **Ví dụ**: "A vintage poster of a city skyline in Art Deco style, geometric patterns, bold contrasting colors, aged paper texture, 1920s aesthetic, high resolution."
`
    };

    let styleGuide = '';
    const lowerCaseStylePrompt = stylePrompt.toLowerCase();
    if (lowerCaseStylePrompt.includes('photorealistic')) styleGuide += styleGuides.photorealistic;
    if (lowerCaseStylePrompt.includes('anime')) styleGuide += styleGuides.anime;
    if (lowerCaseStylePrompt.includes('cyberpunk')) styleGuide += styleGuides.cyberpunk;
    if (lowerCaseStylePrompt.includes('fantasy')) styleGuide += styleGuides.fantasy;
    if (lowerCaseStylePrompt.includes('vintage')) styleGuide += styleGuides.vintage;

    const characterDefPart = characterDefinition 
        ? `
Định nghĩa nhân vật: 
\`\`\`
${characterDefinition}
\`\`\`
        ` 
        : '';

    const context = `
[YÊU CẦU MỚI]
Chế độ: ${mode === 'idea' ? 'Phát triển từ ý tưởng' : 'Tối ưu hóa từ kịch bản sẵn có'}
Tỉ lệ khung hình: ${aspectRatio}
Âm nhạc: ${includeMusic ? 'Có' : 'Không'}
Ngôn ngữ đối thoại: ${dialogueLanguage}
${characterDefPart}

[HƯỚNG DẪN TẠO PROMPT ẢNH THEO PHONG CÁCH]
${styleGuide ? styleGuide : `Tạo prompt dựa trên các từ khóa phong cách sau: ${stylePrompt}`}

[YÊU CẦU ĐẦU RA BỔ SUNG]
- Tạo Prompt Ảnh: ${generateImage ? 'Có' : 'Không'}
- Tạo Prompt Chuyển động: ${generateMotion ? 'Có' : 'Không'}
- Tối ưu cho Whisk (tối đa 3 nhân vật): ${generateWhisk ? 'Có' : 'Không'}
- Tối ưu cho Dreamina (prompt dài 1600 ký tự): ${generateDreamina ? 'Có' : 'Không'}

Nội dung người dùng nhập (bao gồm nhiều chương, mỗi chương sẽ là một hàng trong bảng):
---
${userInput}
---
    `.trim();

    const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ parts: [{ text: context }] }],
        config: { systemInstruction: SYSTEM_INSTRUCTION }
    });

    const responseText = response.text || "";
    return parseGeminiResponse(responseText);
};
