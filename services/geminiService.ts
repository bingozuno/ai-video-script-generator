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

// --- CÁC HƯỚNG DẪN PROMPT (giữ nguyên không đổi) ---
const SYSTEM_PROMPT_FROM_IDEA = `
Bạn là một "Chuyên gia Viết Kịch bản và Prompt cho AI Video" sử dụng mô hình Gemini 2.5 Pro.
... (giữ nguyên toàn bộ nội dung) ...
`;
const SYSTEM_PROMPT_FROM_SCRIPT = `
Bạn là một "Chuyên gia Tạo Prompt cho AI Video" sử dụng mô hình Gemini 2.5 Pro.
... (giữ nguyên toàn bộ nội dung) ...
`;
const PHOTOREALISTIC_GUIDE = `
### Hướng dẫn Phong cách "PHOTOREALISTIC"
... (giữ nguyên toàn bộ nội dung) ...
`;
const ANIME_GUIDE = `
### Hướng dẫn Phong cách "ANIME"
... (giữ nguyên toàn bộ nội dung) ...
`;
const CYBERPUNK_GUIDE = `
### Hướng dẫn Phong cách "CYBERPUNK"
... (giữ nguyên toàn bộ nội dung) ...
`;
const FANTASY_GUIDE = `
### Hướng dẫn Phong cách "FANTASY"
... (giữ nguyên toàn bộ nội dung) ...
`;
const VINTAGE_GUIDE = `
### Hướng dẫn Phong cách "VINTAGE"
... (giữ nguyên toàn bộ nội dung) ...
`;
// --- KẾT THÚC HƯỚNG DẪN PROMPT ---


const parseGeminiResponse = (responseText: string): Script => {
  // ... (Hàm này giữ nguyên không đổi) ...
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
        instructions = "**Yêu cầu Tạo Prompt:** CHỈ TẬP TRUNG vào việc tạo 'Prompt Tạo Ảnh'. Điền 'Không yêu cầu' vào cột 'Prompt Tạo Chuyển động'.";
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
... (giữ nguyên toàn bộ nội dung) ...
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
            throw new Error("Phản hồi không phải là một mảng JSON như mong đợi.");
        }
        return result as StorytellingScene[];
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error("Lỗi khi tạo kịch bản kể chuyện:", e);
        throw new Error(`AI không thể xử lý yêu cầu. Lỗi: ${errorMessage}`);
    }
};