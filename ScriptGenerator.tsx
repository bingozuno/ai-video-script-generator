import React, { useState, useEffect } from 'react';
import type { Script, CharacterReference, StyleInfo, ProjectState, StoryChapter } from './types';
import { generateScript, generateImagesFromPrompt, generateCharacterDefinition, regenerateSingleImagePrompt } from './services/geminiService';
import Header from './components/Header';
import InputForm, { defaultStyles, defaultAspectRatios } from './components/InputForm';
import ScriptDisplay from './components/ScriptDisplay';
import ImageModal from './components/ImageModal';

// --- CÁC HÀM CHIA VĂN BẢN (Giữ nguyên không đổi) ---
const splitTextIntoChaptersLocally = (text: string, rangeStr: string): string[] => {
  const targetChars = parseInt(rangeStr, 10);
  if (isNaN(targetChars) || targetChars <= 0) return text ? [text.trim()] : [];
  const deviation = 200;
  const minChars = Math.max(1, targetChars - deviation);
  const maxChars = targetChars + deviation;
  if (!text || text.trim().length === 0) return [];
  const trimmedText = text.trim();
  const chapters: string[] = [];
  let currentText = trimmedText;
  while (currentText.length > 0) {
    if (currentText.length < targetChars + (targetChars / 2)) {
      chapters.push(currentText);
      break;
    }
    let splitPos = -1;
    const searchEnd = Math.min(maxChars, currentText.length - 1);
    const searchStart = minChars;
    for (let i = searchEnd; i >= searchStart; i--) {
      if ('.!?'.includes(currentText[i]) && (i + 1 >= currentText.length || /\s/.test(currentText[i + 1]))) {
        splitPos = i + 1;
        break;
      }
    }
    if (splitPos === -1) {
      const searchLimit = Math.min(currentText.length, maxChars + 300);
      for (let i = maxChars + 1; i < searchLimit; i++) {
        if ('.!?'.includes(currentText[i]) && (i + 1 >= currentText.length || /\s/.test(currentText[i + 1]))) {
          splitPos = i + 1;
          break;
        }
      }
    }
    if (splitPos === -1) {
      for (let i = searchEnd; i >= searchStart; i--) {
        if (/\s/.test(currentText[i])) {
          splitPos = i + 1;
          break;
        }
      }
    }
    if (splitPos === -1) {
      let lastSpace = currentText.lastIndexOf(' ', maxChars);
      if (lastSpace > 0) splitPos = lastSpace + 1;
      else splitPos = targetChars;
    }
    const chapter = currentText.substring(0, splitPos).trim();
    chapters.push(chapter);
    currentText = currentText.substring(splitPos).trim();
  }
  return chapters.filter(c => c.length > 0);
};

const splitTextIntoNChapters = (text: string, numChapters: number): string[] => {
    const trimmedText = text.trim();
    if (!trimmedText || numChapters <= 0) return [];
    if (numChapters === 1) return [trimmedText];
    const chapters: string[] = [];
    let remainingText = trimmedText;
    for (let i = 0; i < numChapters - 1; i++) {
        const chaptersToCreate = numChapters - i;
        const idealSplitPoint = Math.round(remainingText.length / chaptersToCreate);
        const searchRadius = 150;
        let bestSplitPos = -1;
        let minDistance = Infinity;
        const startSearch = Math.max(0, idealSplitPoint - searchRadius);
        const endSearch = Math.min(remainingText.length - 1, idealSplitPoint + searchRadius);
        for (let j = startSearch; j <= endSearch; j++) {
            if ('.!?'.includes(remainingText[j])) {
                if (j + 1 >= remainingText.length || /\s/.test(remainingText[j + 1] || ' ')) {
                    const distance = Math.abs(j - idealSplitPoint);
                    if (distance < minDistance) {
                        minDistance = distance;
                        bestSplitPos = j + 1;
                    }
                }
            }
        }
        let splitPos = bestSplitPos;
        if (splitPos === -1) {
            minDistance = Infinity;
            for (let j = startSearch; j <= endSearch; j++) {
                if (/\s/.test(remainingText[j])) {
                    const distance = Math.abs(j - idealSplitPoint);
                    if (distance < minDistance) {
                        minDistance = distance;
                        bestSplitPos = j + 1;
                    }
                }
            }
            splitPos = bestSplitPos;
        }
        if (splitPos === -1) splitPos = idealSplitPoint;
        if (splitPos === 0 && remainingText.length > 0) splitPos = Math.min(1, remainingText.length);
        const chapterText = remainingText.substring(0, splitPos).trim();
        if (chapterText) {
            chapters.push(chapterText);
            remainingText = remainingText.substring(splitPos).trim();
        } else if (remainingText.length > 0) {
            const emergencySplit = Math.min(idealSplitPoint > 0 ? idealSplitPoint : 1, remainingText.length);
            chapters.push(remainingText.substring(0, emergencySplit).trim());
            remainingText = remainingText.substring(emergencySplit).trim();
        }
    }
    if (remainingText) chapters.push(remainingText);
    return chapters.filter(c => c.length > 0);
};
// --- KẾT THÚC HÀM CHIA VĂN BẢN ---


interface ScriptGeneratorProps {
  apiKey: string;
}

const ScriptGenerator: React.FC<ScriptGeneratorProps> = ({ apiKey }) => {
  const [script, setScript] = useState<Script | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<{src: string, name: string} | null>(null);
  
  // Input form state
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
  const [longStoryInput, setLongStoryInput] = useState<string>('');
  const [chapterSplitRange, setChapterSplitRange] = useState<string>('1000');
  const [isGeneratingDef, setIsGeneratingDef] = useState<boolean>(false);
  const [splitMode, setSplitMode] = useState<'range' | 'number'>('range');
  const [numberOfChapters, setNumberOfChapters] = useState<string>('5');
  const [storyChapters, setStoryChapters] = useState<StoryChapter[]>([]);
  const [characterSource, setCharacterSource] = useState<'definition' | 'references'>('definition');
  const [limitCharacterCount, setLimitCharacterCount] = useState<boolean>(false);

  // --- QUẢN LÝ TIẾN ĐỘ & TỰ ĐỘNG CHẠY ---
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [isAutoRunning, setIsAutoRunning] = useState<boolean>(false); // State cho chế độ auto
  const BATCH_SIZE = 5; // Số lượng prompt tạo mỗi lần nhấn (ĐÃ SỬA TỪ 3 LÊN 5)
  
   useEffect(() => {
    // Load styles
    try {
        const savedStyles = localStorage.getItem('customVideoStyles');
        const customStyles = savedStyles ? JSON.parse(savedStyles) : [];
        const allStyles = [...defaultStyles, ...customStyles];
        setStyles(allStyles);
        if (allStyles.length > 0) setSelectedStylePrompts([allStyles[0].prompt]);
    } catch (error) {
        console.error("Failed to load styles", error);
        setStyles([...defaultStyles]);
        if (defaultStyles.length > 0) setSelectedStylePrompts([defaultStyles[0].prompt]);
    }
    // Load aspect ratios
    try {
        const savedRatios = localStorage.getItem('customVideoRatios');
        const customRatios = savedRatios ? JSON.parse(savedRatios) : [];
        const allRatios = [...defaultAspectRatios, ...customRatios];
        setAspectRatios(allRatios);
        if (allRatios.length > 0) setAspectRatio(allRatios[0].value);
    } catch (error) { console.error("Failed to load aspect ratios", error); }
  }, []);

  const handleOpenImageModal = (src: string, name: string) => setModalImage({ src, name });
  const handleCloseImageModal = () => setModalImage(null);

  const handleSplitStory = () => {
    if (!longStoryInput.trim()) { setError("Vui lòng nhập câu chuyện để chia."); return; }
    setError(null);
    try {
      let chapters: string[] = [];
      if (splitMode === 'range') {
        if (!chapterSplitRange.trim()) { setError("Vui lòng nhập khoảng ký tự."); return; }
        chapters = splitTextIntoChaptersLocally(longStoryInput, chapterSplitRange);
      } else {
        const num = parseInt(numberOfChapters, 10);
        if (isNaN(num) || num <= 0) { setError("Vui lòng nhập số chương hợp lệ."); return; }
        chapters = splitTextIntoNChapters(longStoryInput, num);
      }
      
      // Reset tiến độ
      setCompletedCount(0);
      setIsAutoRunning(false);
      setScript(null);

      if (chapters.length === 0 && longStoryInput.trim().length > 0) {
        setStoryChapters([{ id: `chapter-${Date.now()}-0`, text: longStoryInput.trim() }]);
      } else {
        setStoryChapters(chapters.map((text, index) => ({ id: `chapter-${Date.now()}-${index}`, text })));
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Lỗi khi chia chương."); }
  };

  const handleGenerateCharacterDefinition = async () => {
    const scriptText = storyChapters.map(c => c.text).join('\n\n').trim();
    if (!scriptText) { alert("Vui lòng nhập kịch bản."); return; }
    setIsGeneratingDef(true); setError(null);
    try {
      const definition = await generateCharacterDefinition(scriptText, apiKey);
      setCharacterDefinition(definition);
    } catch (err) { setError(err instanceof Error ? err.message : "Lỗi không xác định."); } 
    finally { setIsGeneratingDef(false); }
  };

  // --- HÀM TẠO KỊCH BẢN THEO ĐỢT (BATCH) & LOGIC AUTO ---
  const handleGenerateScript = async () => {
    // 1. Xác định phạm vi (batch) cần tạo
    const totalChapters = storyChapters.length;
    
    // Nếu đã hoàn thành hết
    if (completedCount >= totalChapters) {
        if (!isAutoRunning) alert("Đã hoàn thành tạo prompt cho tất cả các chương!");
        return;
    }

    // Kích hoạt chế độ Auto Running
    setIsAutoRunning(true);

    const startIndex = completedCount;
    const endIndex = Math.min(startIndex + BATCH_SIZE, totalChapters);
    const batchChapters = storyChapters.slice(startIndex, endIndex);

    // 2. Chuẩn bị nội dung chỉ cho batch này
    const scriptText = batchChapters
        .map((c, i) => `--- BẮT ĐẦU CHƯƠNG ${startIndex + i + 1} ---\n${c.text}\n--- KẾT THÚC CHƯƠNG ${startIndex + i + 1} ---`)
        .join('\n\n').trim();

    const currentMode = 'script'; 
    
    if (!scriptText.trim()) { setError("Không có nội dung để xử lý."); return; }
    if (selectedStylePrompts.length === 0) { setError("Vui lòng chọn phong cách."); return; }

    setMode(currentMode); setIsLoading(true); setError(null);
    
    try {
      const combinedStylePrompt = selectedStylePrompts.join(', ');
      
      const result = await generateScript(
          scriptText, 
          currentMode, 
          combinedStylePrompt, 
          characterReferences, 
          characterDefinition, 
          aspectRatio, 
          generateImage, 
          generateMotion, 
          includeMusic, 
          dialogueLanguage,
          apiKey,
          characterSource,
          limitCharacterCount 
      );

      // 3. Gộp kết quả mới vào danh sách cũ
      setScript(prevScript => {
          if (!prevScript) {
              return result; 
          }
          return {
              ...prevScript,
              scenes: [...prevScript.scenes, ...result.scenes] 
          };
      });

      // 4. Cập nhật tiến độ
      setCompletedCount(endIndex);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Đã xảy ra một lỗi không xác định.');
      }
      // Nếu lỗi thì dừng auto
      setIsAutoRunning(false);
    } finally {
      setIsLoading(false);
    }
  };

  // --- EFFECT XỬ LÝ TỰ ĐỘNG CHẠY TIẾP ---
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    // Điều kiện: Đang bật Auto, Không đang load, Chưa làm xong hết, và Đã làm được ít nhất 1 đợt
    if (isAutoRunning && !isLoading && completedCount < storyChapters.length && completedCount > 0) {
        console.log(`Đợi 3 giây trước khi tạo batch tiếp theo...`);
        timeout = setTimeout(() => {
            handleGenerateScript();
        }, 3000); // 3000ms = 3 giây
    } 
    // Điều kiện dừng: Khi đã làm xong hết các chương
    else if (completedCount >= storyChapters.length && isAutoRunning) {
        setIsAutoRunning(false);
        alert("Đã hoàn thành tạo prompt cho TẤT CẢ các chương!");
    }

    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedCount, isAutoRunning, isLoading, storyChapters.length]);

  const handleResetProgress = () => {
      if (confirm("Bạn có chắc muốn xóa toàn bộ prompts đã tạo và làm lại từ đầu không?")) {
          setCompletedCount(0);
          setIsAutoRunning(false);
          setScript(null);
          setError(null);
      }
  };

  const handleGenerateImage = async (sceneIndex: number) => {
    if (!script || !script.scenes[sceneIndex]) return;
    setScript(prev => {
        if (!prev) return null;
        const newScenes = [...prev.scenes];
        newScenes[sceneIndex] = { ...newScenes[sceneIndex], isGeneratingImages: true, generatedImages: [] };
        return { ...prev, scenes: newScenes };
    });
    setError(null);
    try {
        const scene = script.scenes[sceneIndex];
        const generatedImagesBase64 = await generateImagesFromPrompt(scene.imagePrompt, aspectRatio, apiKey);
        const generatedImagesDataUrls = generatedImagesBase64.map(b64 => `data:image/png;base64,${b64}`);
        setScript(prev => {
            if (!prev) return null;
            const newScenes = [...prev.scenes];
            newScenes[sceneIndex] = { ...newScenes[sceneIndex], generatedImages: generatedImagesDataUrls, isGeneratingImages: false };
            return { ...prev, scenes: newScenes };
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Lỗi không xác định.";
        setError(`Lỗi tạo ảnh cảnh ${sceneIndex + 1}: ${errorMessage}`);
        setScript(prev => {
            if (!prev) return null;
            const newScenes = [...prev.scenes];
            newScenes[sceneIndex] = { ...newScenes[sceneIndex], isGeneratingImages: false };
            return { ...prev, scenes: newScenes };
        });
    }
  };

  const handleRegeneratePrompt = async (sceneIndex: number) => {
    if (!script || !script.scenes[sceneIndex]) return;
    setScript(prev => {
        if (!prev) return null;
        const newScenes = [...prev.scenes];
        newScenes[sceneIndex] = { ...newScenes[sceneIndex], isRegeneratingPrompt: true };
        return { ...prev, scenes: newScenes };
    });
    setError(null);
    try {
        const scene = script.scenes[sceneIndex];
        let finalCharacterDefinition = "";
        if (characterSource === 'references') {
            const refs = characterReferences.filter(r => r.description.trim()).map(r => `- ${r.name}: ${r.description.trim()}`);
            finalCharacterDefinition = refs.length > 0 ? refs.join('\n') : "Trống";
        } else {
            finalCharacterDefinition = characterDefinition.trim() || "Trống";
        }
        const combinedStyle = selectedStylePrompts.join(', ');
        const newPrompt = await regenerateSingleImagePrompt(
            scene.description,
            finalCharacterDefinition,
            combinedStyle,
            aspectRatio,
            apiKey
        );
        setScript(prev => {
            if (!prev) return null;
            const newScenes = [...prev.scenes];
            newScenes[sceneIndex] = { ...newScenes[sceneIndex], imagePrompt: newPrompt, isRegeneratingPrompt: false };
            return { ...prev, scenes: newScenes };
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Lỗi";
        setError(`Lỗi tạo lại prompt cảnh ${sceneIndex + 1}: ${msg}`);
        setScript(prev => {
            if (!prev) return null;
            const newScenes = [...prev.scenes];
            newScenes[sceneIndex] = { ...newScenes[sceneIndex], isRegeneratingPrompt: false };
            return { ...prev, scenes: newScenes };
        });
    }
  };

  const handleExportProject = () => {
    const projectState: ProjectState = {
      mode, ideaInput, longStoryInput, storyChapters, selectedStylePrompts, characterReferences, 
      characterDefinition, aspectRatio, generateImage, generateMotion, includeMusic, dialogueLanguage, script,
      limitCharacterCount 
    };
    const dataStr = JSON.stringify(projectState, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', 'ai_video_project.json');
    linkElement.click();
  };

  const handleImportProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error('Invalid file');
        const projectState = JSON.parse(text) as Partial<ProjectState>;
        setMode(projectState.mode || 'idea');
        setIdeaInput(projectState.ideaInput || '');
        setLongStoryInput(projectState.longStoryInput || '');
        if (projectState.storyChapters) setStoryChapters(projectState.storyChapters.map(({ id, text }) => ({ id, text })));
        else setStoryChapters([]);
        if (projectState.selectedStylePrompts) setSelectedStylePrompts(projectState.selectedStylePrompts);
        else setSelectedStylePrompts([]);
        setCharacterReferences(projectState.characterReferences || []);
        setCharacterDefinition(projectState.characterDefinition || '');
        setAspectRatio(projectState.aspectRatio || '16:9');
        setGenerateImage(projectState.generateImage !== false);
        setGenerateMotion(projectState.generateMotion !== false);
        setIncludeMusic(projectState.includeMusic || false);
        setDialogueLanguage(projectState.dialogueLanguage || 'Vietnamese');
        
        setLimitCharacterCount(projectState.limitCharacterCount || false);

        setScript(projectState.script || null);
        
        // Reset tiến độ khi import
        setCompletedCount(projectState.script?.scenes.length || 0); 
        setIsAutoRunning(false);
        
        alert('Dự án đã nạp thành công!');
      } catch (err) { console.error(err); alert('File lỗi.'); }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <>
      <Header />
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg border border-slate-700">
          <InputForm
            apiKey={apiKey} 
            characterSource={characterSource}
            setCharacterSource={setCharacterSource}
            mode={mode} ideaInput={ideaInput} longStoryInput={longStoryInput} chapterSplitRange={chapterSplitRange}
            selectedStylePrompts={selectedStylePrompts} characterReferences={characterReferences} characterDefinition={characterDefinition}
            aspectRatio={aspectRatio} generateImage={generateImage} generateMotion={generateMotion} includeMusic={includeMusic}
            dialogueLanguage={dialogueLanguage} isLoading={isLoading} isSplitting={false} isGeneratingDef={isGeneratingDef}
            styles={styles} aspectRatios={aspectRatios} storyChapters={storyChapters} splitMode={splitMode} numberOfChapters={numberOfChapters}
            
            limitCharacterCount={limitCharacterCount}
            setLimitCharacterCount={setLimitCharacterCount}

            setMode={setMode} setIdeaInput={setIdeaInput} setLongStoryInput={setLongStoryInput} setChapterSplitRange={setChapterSplitRange}
            setSelectedStylePrompts={setSelectedStylePrompts} setCharacterReferences={setCharacterReferences} setCharacterDefinition={setCharacterDefinition}
            setAspectRatio={setAspectRatio} setGenerateImage={setGenerateImage} setGenerateMotion={setGenerateMotion} setIncludeMusic={setIncludeMusic}
            setDialogueLanguage={setDialogueLanguage} setStyles={setStyles} setAspectRatios={setAspectRatios} setStoryChapters={setStoryChapters}
            setSplitMode={setSplitMode} setNumberOfChapters={setNumberOfChapters}
            
            onSubmit={handleGenerateScript} 
            onExport={handleExportProject} onImport={handleImportProject} onSplitStory={handleSplitStory}
            onGenerateCharacterDefinition={handleGenerateCharacterDefinition}
          />
        </div>
        <ScriptDisplay 
          script={script} 
          storyChapters={storyChapters}
          isLoading={isLoading} 
          error={error} 
          onGenerateImage={handleGenerateImage}
          onRegeneratePrompt={handleRegeneratePrompt}
          onOpenImage={handleOpenImageModal}
        />
        {/* Nút reset tiện ích (nếu cần hiển thị ở UI) */}
        {completedCount > 0 && completedCount < storyChapters.length && !isLoading && !isAutoRunning && (
            <div className="text-center mt-4">
                <p className="text-slate-400 mb-2">Đã tạo {completedCount}/{storyChapters.length} chương.</p>
                <button 
                  onClick={handleGenerateScript}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Tiếp tục tạo chương tiếp theo
                </button>
            </div>
        )}
      </main>
      <footer className="text-center py-4 text-slate-500 text-sm">
        <p>
          <span className="text-green-500 text-[15px]">Bản quyền thuộc về </span>
          <span className="text-blue-500 text-[18px] font-bold">TIẾN DŨNG JXD</span>
        </p>
      </footer>
      <ImageModal isOpen={!!modalImage} onClose={handleCloseImageModal} imageUrl={modalImage?.src || null} imageName={modalImage?.name || null} />
    </>
  );
};

export default ScriptGenerator;