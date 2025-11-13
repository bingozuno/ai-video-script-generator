import React, { useState, useEffect } from 'react';
// SỬA LỖI: Thêm `generateImagesFromPrompt` và `generateCharacterDefinition` vào import
import type { Script, CharacterReference, StyleInfo, ProjectState, StorytellingScene, StoryChapter } from './types';
import { generateScript, generateImagesFromPrompt, generateCharacterDefinition } from './services/geminiService';
import Header from './components/Header';
import InputForm, { defaultStyles, defaultAspectRatios } from './components/InputForm';
import ScriptDisplay from './components/ScriptDisplay';
import ImageModal from './components/ImageModal';

// --- CÁC HÀM CHIA VĂN BẢN (Giữ nguyên) ---
const splitTextIntoChaptersLocally = (text: string, rangeStr: string): string[] => {
  // ... (giữ nguyên toàn bộ nội dung hàm này) ...
  // 1. Parse input. The input is a single number string from the form.
  const targetChars = parseInt(rangeStr, 10);
  if (isNaN(targetChars) || targetChars <= 0) {
    return text ? [text.trim()] : [];
  }
  const deviation = 200;
  const minChars = Math.max(1, targetChars - deviation);
  const maxChars = targetChars + deviation;

  if (!text || text.trim().length === 0) return [];
  const trimmedText = text.trim();
  const chapters: string[] = [];
  let currentText = trimmedText;

  while (currentText.length > 0) {
    // If remaining text is short enough, it's the last chapter.
    // A threshold of 1.5 * target is a safe bet to avoid tiny leftover chapters.
    if (currentText.length < targetChars + (targetChars / 2)) {
      chapters.push(currentText);
      break;
    }

    let splitPos = -1;

    // Define search window.
    const searchEnd = Math.min(maxChars, currentText.length - 1);
    const searchStart = minChars;

    // 2. Ideal case: Find the last sentence end in the [min, max] window.
    for (let i = searchEnd; i >= searchStart; i--) {
      if ('.!?'.includes(currentText[i]) && (i + 1 >= currentText.length || /\s/.test(currentText[i + 1]))) {
        splitPos = i + 1;
        break;
      }
    }

    // 3. Fallback 1: If no sentence end in range, find the first one just AFTER the window.
    if (splitPos === -1) {
      const searchLimit = Math.min(currentText.length, maxChars + 300); // Don't search forever
      for (let i = maxChars + 1; i < searchLimit; i++) {
        if ('.!?'.includes(currentText[i]) && (i + 1 >= currentText.length || /\s/.test(currentText[i + 1]))) {
          splitPos = i + 1;
          break;
        }
      }
    }

    // 4. Fallback 2: If still no punctuation, find the last space in the [min, max] window.
    if (splitPos === -1) {
      for (let i = searchEnd; i >= searchStart; i--) {
        if (/\s/.test(currentText[i])) {
          splitPos = i + 1;
          break;
        }
      }
    }

    // 5. Ultimate Fallback: If no good split points found (e.g., long string with no spaces),
    // find the last space before the `maxChars` point. This ensures we split at a word boundary.
    if (splitPos === -1) {
      let lastSpace = currentText.lastIndexOf(' ', maxChars);
      if (lastSpace > 0) {
        splitPos = lastSpace + 1;
      } else {
        // If there are no spaces at all in the first `maxChars` characters,
        // we have no choice but to split at the target length.
        splitPos = targetChars;
      }
    }

    const chapter = currentText.substring(0, splitPos).trim();
    chapters.push(chapter);
    currentText = currentText.substring(splitPos).trim();
  }

  return chapters.filter(c => c.length > 0);
};
const splitTextIntoNChapters = (text: string, numChapters: number): string[] => {
    // ... (giữ nguyên toàn bộ nội dung hàm này) ...
    const trimmedText = text.trim();
    if (!trimmedText || numChapters <= 0) return [];
    if (numChapters === 1) return [trimmedText];

    const chapters: string[] = [];
    let remainingText = trimmedText;

    // We create numChapters - 1 splits. The last chapter is what's left.
    for (let i = 0; i < numChapters - 1; i++) {
        const chaptersToCreate = numChapters - i;
        const idealSplitPoint = Math.round(remainingText.length / chaptersToCreate);

        // User wants max 300 char difference. A search radius of 150 on either side of the ideal
        // split point helps achieve this by limiting how far a chapter can deviate from the average.
        const searchRadius = 150;
        let bestSplitPos = -1;
        let minDistance = Infinity;

        const startSearch = Math.max(0, idealSplitPoint - searchRadius);
        const endSearch = Math.min(remainingText.length - 1, idealSplitPoint + searchRadius);

        // First pass: find the closest sentence-ending punctuation mark.
        for (let j = startSearch; j <= endSearch; j++) {
            if ('.!?'.includes(remainingText[j])) {
                // Ensure it's the end of a word (followed by space or end of text)
                if (j + 1 >= remainingText.length || /\s/.test(remainingText[j + 1] || ' ')) {
                    const distance = Math.abs(j - idealSplitPoint);
                    if (distance < minDistance) {
                        minDistance = distance;
                        bestSplitPos = j + 1; // Split after the punctuation
                    }
                }
            }
        }

        let splitPos = bestSplitPos;

        // Fallback: If no punctuation found, find the closest space.
        if (splitPos === -1) {
            minDistance = Infinity; // Reset for space search
            for (let j = startSearch; j <= endSearch; j++) {
                if (/\s/.test(remainingText[j])) {
                    const distance = Math.abs(j - idealSplitPoint);
                    if (distance < minDistance) {
                        minDistance = distance;
                        bestSplitPos = j + 1; // Split after the space
                    }
                }
            }
            splitPos = bestSplitPos;
        }

        // Desperate Fallback: If still no good split point, cut at the ideal point.
        if (splitPos === -1) {
            splitPos = idealSplitPoint;
        }
        
        // Safety net: Ensure splitPos is at least 1 to prevent infinite loops on short remainingText
        if (splitPos === 0 && remainingText.length > 0) {
            splitPos = Math.min(1, remainingText.length);
        }

        const chapterText = remainingText.substring(0, splitPos).trim();
        
        if (chapterText) {
            chapters.push(chapterText);
            remainingText = remainingText.substring(splitPos).trim();
        } else if (remainingText.length > 0) {
            // Emergency brake to prevent getting stuck if logic fails.
            // This should rarely be hit with the improved logic.
            const emergencySplit = Math.min(idealSplitPoint > 0 ? idealSplitPoint : 1, remainingText.length);
            chapters.push(remainingText.substring(0, emergencySplit).trim());
            remainingText = remainingText.substring(emergencySplit).trim();
        }
    }

    // Add the final remaining part as the last chapter.
    if (remainingText) {
        chapters.push(remainingText);
    }

    return chapters.filter(c => c.length > 0);
};
// --- KẾT THÚC HÀM CHIA VĂN BẢN ---


// SỬA LỖI: Thêm apiKey vào props
interface ScriptGeneratorProps {
  apiKey: string;
}

// SỬA LỖI: Nhận { apiKey } từ props
const ScriptGenerator: React.FC<ScriptGeneratorProps> = ({ apiKey }) => {
  const [script, setScript] = useState<Script | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<{src: string, name: string} | null>(null);
  
  // Input form state lifted up to App component
  const [mode, setMode] = useState<'idea' | 'script'>('idea');
  const [ideaInput, setIdeaInput] = useState('');
  const [styles, setStyles] = useState<StyleInfo[]>([]);
  const [selectedStylePrompts, setSelectedStylePrompts] = useState<string[]>([]);
  const [characterReferences, setCharacterReferences] = useState<CharacterReference[]>([
    { id: `char-${Date.now()}`, name: 'Nhân vật 1', imageBase64: null, fileType: null, description: '', isAnalyzing: false },
  ]);
  const [characterDefinition, setCharacterDefinition] = useState<string>('');
  const [aspectRatios, setAspectRatios] = useState(defaultAspectRatios);
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [generateImage, setGenerateImage] = useState<boolean>(true);
  const [generateMotion, setGenerateMotion] = useState<boolean>(true);
  const [includeMusic, setIncludeMusic] = useState<boolean>(false);
  const [dialogueLanguage, setDialogueLanguage] = useState<string>('Vietnamese');

  // State for new story splitting feature
  const [longStoryInput, setLongStoryInput] = useState<string>('');
  const [chapterSplitRange, setChapterSplitRange] = useState<string>('1000');
  const [isGeneratingDef, setIsGeneratingDef] = useState<boolean>(false);
  const [splitMode, setSplitMode] = useState<'range' | 'number'>('range');
  const [numberOfChapters, setNumberOfChapters] = useState<string>('5');

  // State for multi-chapter TTS feature
  const [storyChapters, setStoryChapters] = useState<StoryChapter[]>([]);
  
  // ... (Hàm useEffect giữ nguyên) ...
  useEffect(() => {
    // Load visual styles
    try {
        const savedStyles = localStorage.getItem('customVideoStyles');
        const customStyles = savedStyles ? JSON.parse(savedStyles) : [];
        const allStyles = [...defaultStyles, ...customStyles];
        setStyles(allStyles);
        if (allStyles.length > 0) {
            setSelectedStylePrompts([allStyles[0].prompt]);
        }
    } catch (error) {
        console.error("Failed to load styles from localStorage", error);
        setStyles([...defaultStyles]);
        if (defaultStyles.length > 0) {
            setSelectedStylePrompts([defaultStyles[0].prompt]);
        }
    }
    // Load aspect ratios
    try {
        const savedRatios = localStorage.getItem('customVideoRatios');
        const customRatios = savedRatios ? JSON.parse(savedRatios) : [];
        const allRatios = [...defaultAspectRatios, ...customRatios];
        setAspectRatios(allRatios);
        if (allRatios.length > 0) {
            setAspectRatio(allRatios[0].value);
        }
    } catch (error) {
        console.error("Failed to load aspect ratios from localStorage", error);
    }
  }, []);

  const handleOpenImageModal = (src: string, name: string) => {
    setModalImage({ src, name });
  };

  const handleCloseImageModal = () => {
    setModalImage(null);
  };

  const handleSplitStory = () => {
    // ... (Hàm này giữ nguyên) ...
    if (!longStoryInput.trim()) {
      setError("Vui lòng nhập câu chuyện để chia.");
      return;
    }
    setError(null);
    try {
      let chapters: string[] = [];
      if (splitMode === 'range') {
        if (!chapterSplitRange.trim()) {
          setError("Vui lòng nhập khoảng ký tự để chia chương.");
          return;
        }
        chapters = splitTextIntoChaptersLocally(longStoryInput, chapterSplitRange);
      } else { // splitMode === 'number'
        const num = parseInt(numberOfChapters, 10);
        if (isNaN(num) || num <= 0) {
          setError("Vui lòng nhập một số chương hợp lệ (lớn hơn 0).");
          return;
        }
        chapters = splitTextIntoNChapters(longStoryInput, num);
      }

      if (chapters.length === 0 && longStoryInput.trim().length > 0) {
        setStoryChapters([{ id: `chapter-${Date.now()}-0`, text: longStoryInput.trim() }]);
      } else {
        const newStoryChapters: StoryChapter[] = chapters.map((text, index) => ({
          id: `chapter-${Date.now()}-${index}`,
          text,
        }));
        setStoryChapters(newStoryChapters);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi khi chia chương.");
    }
  };

  const handleGenerateCharacterDefinition = async () => {
    // ... (Hàm này giữ nguyên phần logic, chỉ SỬA LỖI ở dòng gọi API) ...
    const scriptText = storyChapters.map(c => c.text).join('\n\n').trim();
    if (!scriptText) {
      alert("Vui lòng nhập kịch bản vào các chương trước khi tạo định nghĩa nhân vật.");
      return;
    }
    
    setIsGeneratingDef(true);
    setError(null);
    try {
      // SỬA LỖI: Truyền `apiKey` vào hàm
      const definition = await generateCharacterDefinition(scriptText, apiKey);
      setCharacterDefinition(definition);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.";
      setError(errorMessage);
    } finally {
      setIsGeneratingDef(false);
    }
  };


  const handleGenerateScript = async () => {
    // ... (Hàm này giữ nguyên phần logic, chỉ SỬA LỖI ở dòng gọi API) ...
    const scriptText = storyChapters
        .map((c, i) => `--- BẮT ĐẦU CHƯƠНG ${i + 1} ---\n${c.text}\n--- KẾT THÚC CHƯƠНG ${i + 1} ---`)
        .join('\n\n').trim();

    const currentMode = scriptText ? 'script' : 'idea';
    const currentInput = currentMode === 'script' ? scriptText : ideaInput;

    if (!currentInput.trim()) {
      setError("Vui lòng nhập ý tưởng hoặc nhập kịch bản chi tiết.");
      return;
    }
    
    if (selectedStylePrompts.length === 0) {
      setError("Vui lòng chọn ít nhất một phong cách.");
      return;
    }

    setMode(currentMode);
    setIsLoading(true);
    setError(null);
    setScript(null);

    try {
      const combinedStylePrompt = selectedStylePrompts.join(', ');
      
      // SỬA LỖI: Truyền `apiKey` làm tham số cuối cùng
      const result = await generateScript(
          currentInput, 
          currentMode, 
          combinedStylePrompt, 
          characterReferences, 
          characterDefinition, 
          aspectRatio, 
          generateImage, 
          generateMotion, 
          includeMusic, 
          dialogueLanguage,
          apiKey // <-- ĐÃ THÊM
      );
      setScript(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Đã xảy ra một lỗi không xác định.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async (sceneIndex: number) => {
    // ... (Hàm này giữ nguyên phần logic, chỉ SỬA LỖI ở dòng gọi API) ...
    if (!script || !script.scenes[sceneIndex]) return;

    setScript(prevScript => {
        if (!prevScript) return null;
        const newScenes = [...prevScript.scenes];
        newScenes[sceneIndex] = { ...newScenes[sceneIndex], isGeneratingImages: true, generatedImages: [] };
        return { ...prevScript, scenes: newScenes };
    });
    setError(null);

    try {
        const scene = script.scenes[sceneIndex];
        
        // SỬA LỖI: Truyền `apiKey` vào hàm
        const generatedImagesBase64 = await generateImagesFromPrompt(scene.imagePrompt, aspectRatio, apiKey);
        const generatedImagesDataUrls = generatedImagesBase64.map(b64 => `data:image/png;base64,${b64}`);

        setScript(prevScript => {
            if (!prevScript) return null;
            const newScenes = [...prevScript.scenes];
            newScenes[sceneIndex] = { 
                ...newScenes[sceneIndex], 
                generatedImages: generatedImagesDataUrls,
                isGeneratingImages: false 
            };
            return { ...prevScript, scenes: newScenes };
        });

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định.";
        setError(`Lỗi tạo ảnh cho Cảnh ${sceneIndex + 1}: ${errorMessage}`);
        setScript(prevScript => {
            if (!prevScript) return null;
            const newScenes = [...prevScript.scenes];
            newScenes[sceneIndex] = { ...newScenes[sceneIndex], isGeneratingImages: false };
            return { ...prevScript, scenes: newScenes };
        });
    }
  };

  // --- CÁC HÀM XUẤT/NHẬP (Giữ nguyên) ---
  const handleExportProject = () => {
    // ... (giữ nguyên toàn bộ nội dung hàm này) ...
    const projectState: ProjectState = {
      mode,
      ideaInput,
      longStoryInput,
      storyChapters,
      selectedStylePrompts,
      characterReferences,
      characterDefinition,
      aspectRatio,
      generateImage,
      generateMotion,
      includeMusic,
      dialogueLanguage,
      script,
    };
    const dataStr = JSON.stringify(projectState, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'ai_video_project.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    // ... (giữ nguyên toàn bộ nội dung hàm này) ...
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error('File content is not valid text.');
        }
        const projectState = JSON.parse(text) as Partial<ProjectState>;

        setMode(projectState.mode || 'idea');
        setIdeaInput(projectState.ideaInput || '');
        setLongStoryInput(projectState.longStoryInput || '');
        
        if (projectState.storyChapters && projectState.storyChapters.length > 0) {
           const simplifiedChapters = projectState.storyChapters.map(({ id, text }) => ({ id, text }));
           setStoryChapters(simplifiedChapters);
        } else {
          setStoryChapters([]);
        }
        
        if (projectState.selectedStylePrompts && Array.isArray(projectState.selectedStylePrompts)) {
          setSelectedStylePrompts(projectState.selectedStylePrompts);
        } else {
          setSelectedStylePrompts([]);
        }

        setCharacterReferences(projectState.characterReferences || []);
        setCharacterDefinition(projectState.characterDefinition || '');
        setAspectRatio(projectState.aspectRatio || '16:9');
        setGenerateImage(projectState.generateImage === false ? false : true);
        setGenerateMotion(projectState.generateMotion === false ? false : true);
        setIncludeMusic(projectState.includeMusic || false);
        setDialogueLanguage(projectState.dialogueLanguage || 'Vietnamese');
        setScript(projectState.script || null);
        
        alert('Dự án đã được nạp thành công!');

      } catch (err) {
        console.error("Error parsing project file:", err);
        alert('Tệp dự án không hợp lệ hoặc đã bị hỏng.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };
  // --- KẾT THÚC HÀM XUẤT/NHẬP ---

  return (
    <>
      <Header />
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg border border-slate-700">
          <InputForm
            // SỬA LỖI: Truyền `apiKey` xuống cho `InputForm`
            apiKey={apiKey} 
            
            // ... (Các props khác giữ nguyên) ...
            mode={mode}
            ideaInput={ideaInput}
            longStoryInput={longStoryInput}
            chapterSplitRange={chapterSplitRange}
            selectedStylePrompts={selectedStylePrompts}
            characterReferences={characterReferences}
            characterDefinition={characterDefinition}
            aspectRatio={aspectRatio}
            generateImage={generateImage}
            generateMotion={generateMotion}
            includeMusic={includeMusic}
            dialogueLanguage={dialogueLanguage}
            isLoading={isLoading}
            isSplitting={false} 
            isGeneratingDef={isGeneratingDef}
            styles={styles}
            aspectRatios={aspectRatios}
            storyChapters={storyChapters}
            splitMode={splitMode}
            numberOfChapters={numberOfChapters}
            // Handlers
            setMode={setMode}
            setIdeaInput={setIdeaInput}
            setLongStoryInput={setLongStoryInput}
            setChapterSplitRange={setChapterSplitRange}
            setSelectedStylePrompts={setSelectedStylePrompts}
            setCharacterReferences={setCharacterReferences}
            setCharacterDefinition={setCharacterDefinition}
            setAspectRatio={setAspectRatio}
            setGenerateImage={setGenerateImage}
            setGenerateMotion={setGenerateMotion}
            setIncludeMusic={setIncludeMusic}
            setDialogueLanguage={setDialogueLanguage}
            setStyles={setStyles}
            setAspectRatios={setAspectRatios}
            setStoryChapters={setStoryChapters}
            setSplitMode={setSplitMode}
            setNumberOfChapters={setNumberOfChapters}
            // Actions
            onSubmit={handleGenerateScript}
            onExport={handleExportProject}
            onImport={handleImportProject}
            onSplitStory={handleSplitStory}
            onGenerateCharacterDefinition={handleGenerateCharacterDefinition}
          />
        </div>
        <ScriptDisplay 
          script={script} 
          storyChapters={storyChapters}
          isLoading={isLoading} 
          error={error} 
          onGenerateImage={handleGenerateImage}
          onOpenImage={handleOpenImageModal}
        />
      </main>
      <footer className="text-center py-4 text-slate-500 text-sm">
        <p>
          <span className="text-green-500 text-[15px]">Bản quyền thuộc về </span>
          <span className="text-blue-500 text-[18px] font-bold">TIẾN DŨNG JXD</span>
        </p>
      </footer>
      <ImageModal 
        isOpen={!!modalImage}
        onClose={handleCloseImageModal}
        imageUrl={modalImage?.src || null}
        imageName={modalImage?.name || null}
      />
    </>
  );
};

export default ScriptGenerator;