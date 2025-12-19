
import React, { useState, useEffect, useRef } from 'react';
import type { Script, StyleInfo, ProjectState, StoryChapter } from './types';
import { GoogleGenAI } from '@google/genai';
import { generateScript, generateCharacterDefinition, generateImagesFromPrompt, regenerateImagePrompt } from './services/geminiService';
import Header from './components/Header';
import InputForm, { defaultStyles, defaultAspectRatios } from './components/InputForm';
import ScriptDisplay from './components/ScriptDisplay';
import ImageModal from './components/ImageModal';
import LoginScreen from './components/LoginScreen';
import CoffeeModal from './components/CoffeeModal';
import { translations } from './locales/translations';


type GenerationStatus = 'idle' | 'generating' | 'done';

const App: React.FC = () => {
  const [lang, setLang] = useState<'vi' | 'en'>(() => {
    const savedLang = localStorage.getItem('app_lang');
    if (savedLang === 'vi' || savedLang === 'en') {
      return savedLang;
    }
    const browserLang = navigator.language?.toLowerCase();
    return browserLang && browserLang.startsWith('vi') ? 'vi' : 'en';
  });
  
  const t = translations[lang];

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [aiInstance, setAiInstance] = useState<GoogleGenAI | null>(null);

  const [script, setScript] = useState<Script | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<{src: string, name: string} | null>(null);
  const [isCoffeeModalOpen, setIsCoffeeModalOpen] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle');
  
  const generationCancelled = useRef(false);
  
  const [mode, setMode] = useState<'idea' | 'script'>('idea');
  const [ideaInput, setIdeaInput] = useState('');
  const [styles, setStyles] = useState<StyleInfo[]>([]);
  const [selectedStylePrompts, setSelectedStylePrompts] = useState<string[]>([]);
  const [characterDefinition, setCharacterDefinition] = useState<string>('');
  const [aspectRatios, setAspectRatios] = useState(defaultAspectRatios);
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [generateImage, setGenerateImage] = useState<boolean>(true);
  const [generateMotion, setGenerateMotion] = useState<boolean>(true);
  const [generateWhisk, setGenerateWhisk] = useState<boolean>(false);
  const [generateDreamina, setGenerateDreamina] = useState<boolean>(false);
  const [includeMusic, setIncludeMusic] = useState<boolean>(false);
  const [dialogueLanguage, setDialogueLanguage] = useState<string>('Vietnamese');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-pro');

  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  const [storyChapters, setStoryChapters] = useState<StoryChapter[]>([
    { id: `chapter-${Date.now()}`, text: '' },
  ]);
  
  useEffect(() => {
    const localIsAuthenticated = localStorage.getItem('app_authenticated');
    if (localIsAuthenticated === 'true') {
        setIsAuthenticated(true);
    }

    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  useEffect(() => {
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        setAiInstance(ai);
        setError(null);
      } catch (e) {
        console.error("Failed to initialize GoogleGenAI:", e);
        setAiInstance(null);
        setError(lang === 'vi' ? 'API Key không hợp lệ.' : 'Invalid API Key.');
      }
    } else {
      setAiInstance(null);
    }
  }, [apiKey, lang]);

   useEffect(() => {
    try {
        const savedStyles = localStorage.getItem('customVideoStyles');
        const customStyles = savedStyles ? JSON.parse(savedStyles) : [];
        const allStyles = [...defaultStyles, ...customStyles];
        setStyles(allStyles);
        if (allStyles.length > 0 && selectedStylePrompts.length === 0) {
            setSelectedStylePrompts([allStyles[0].prompt]);
        }
    } catch (error) {
        setStyles([...defaultStyles]);
        if (defaultStyles.length > 0 && selectedStylePrompts.length === 0) {
            setSelectedStylePrompts([defaultStyles[0].prompt]);
        }
    }
    
    try {
        const savedRatios = localStorage.getItem('customVideoRatios');
        const customRatios = savedRatios ? JSON.parse(savedRatios) : [];
        const allRatios = [...defaultAspectRatios, ...customRatios];
        setAspectRatios(allRatios);
    } catch (error) {
        console.error("Failed to load ratios");
    }

  }, []);
  
  const handleLangChange = (newLang: 'vi' | 'en') => {
    localStorage.setItem('app_lang', newLang);
    setLang(newLang);
  };

  const handleSaveKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
    localStorage.removeItem('app_authenticated');
    setIsAuthenticated(false);
  };

  const handleDeleteKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    localStorage.removeItem('app_authenticated');
    setIsAuthenticated(false);
  };
  
  const handleLoginSuccess = () => {
    localStorage.setItem('app_authenticated', 'true');
    setIsAuthenticated(true);
  };

  const handleOpenImageModal = (src: string, name: string) => {
    setModalImage({ src, name });
  };

  const handleCloseImageModal = () => {
    setModalImage(null);
  };

  const handleOpenCoffeeModal = () => {
    setIsCoffeeModalOpen(true);
  };

  const handleCloseCoffeeModal = () => {
    setIsCoffeeModalOpen(false);
  };

  const handleGenerateCharacterDefinition = async () => {
    if (!aiInstance) {
      setError(lang === 'vi' ? 'Vui lòng nhập và lưu API Key của bạn.' : 'Please enter and save your API Key.');
      return;
    }
    const storyText = ideaInput.trim();
    if (!storyText) {
      alert(lang === 'vi' ? "Vui lòng nhập nội dung vào mục 'Nhập câu chuyện' trước khi tạo định nghĩa nhân vật." : "Please enter content in the 'Story Input' field before generating character definitions.");
      return;
    }
    
    setIsChatLoading(true);
    setError(null);
    try {
      const definition = await generateCharacterDefinition(aiInstance, storyText, selectedModel);
      setCharacterDefinition(definition);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error.");
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleStopGeneration = () => {
    generationCancelled.current = true;
    setGenerationStatus('idle');
    setError(lang === 'vi' ? 'Quá trình tạo đã bị dừng.' : 'Generation stopped by user.');
  };

  const handleGenerateScript = async () => {
      if (!aiInstance) {
        setError(lang === 'vi' ? 'Vui lòng nhập và lưu API Key của bạn.' : 'Please enter and save your API Key.');
        return;
      }
      const chaptersToProcess = storyChapters.filter(c => c.text.trim());
      if (chaptersToProcess.length === 0 && !ideaInput.trim()) {
          setError(lang === 'vi' ? "Vui lòng nhập câu chuyện hoặc nhập kịch bản đã chia cảnh." : "Please enter a story or a breakdown script.");
          return;
      }
      
      if (selectedStylePrompts.length === 0) {
          setError(lang === 'vi' ? "Vui lòng chọn ít nhất một phong cách." : "Please select at least one style.");
          return;
      }
  
      setGenerationStatus('generating');
      generationCancelled.current = false;
      setError(null);
      setScript(null);

      try {
        const isScriptMode = chaptersToProcess.length > 0;
        const finalUserInput = isScriptMode
            ? chaptersToProcess.map((chapter, index) => `### CHƯƠNG ${index + 1}\n\n${chapter.text}`).join('\n\n---\n\n')
            : ideaInput;
        const currentMode = isScriptMode ? 'script' : 'idea';
        const combinedStylePrompt = selectedStylePrompts.join(', ');

        const result = await generateScript(
            aiInstance,
            selectedModel,
            finalUserInput,
            currentMode,
            combinedStylePrompt,
            characterDefinition,
            aspectRatio,
            generateImage,
            generateMotion,
            generateWhisk,
            generateDreamina,
            includeMusic,
            dialogueLanguage
        );

        if (generationCancelled.current) {
            setGenerationStatus('idle');
            return;
        }

        setScript(result);
        setGenerationStatus('done');
        handleOpenCoffeeModal();

    } catch (err) {
        if (generationCancelled.current) {
            setError(lang === 'vi' ? 'Quá trình tạo đã bị dừng.' : 'Generation stopped by user.');
        } else {
            setError(err instanceof Error ? err.message : 'Error.');
        }
        setGenerationStatus('idle');
    }
  };

  const handleRegenerateImagePrompt = async (sceneIndex: number) => {
    if (!aiInstance) {
      setError(lang === 'vi' ? 'Vui lòng nhập và lưu API Key của bạn.' : 'Please enter and save your API Key.');
      return;
    }
    if (!script || !script.scenes[sceneIndex]) return;

    const scene = script.scenes[sceneIndex];
    
    setScript(prevScript => {
        if (!prevScript) return null;
        const newScenes = [...prevScript.scenes];
        newScenes[sceneIndex] = { ...newScenes[sceneIndex], isGeneratingImages: true };
        return { ...prevScript, scenes: newScenes };
    });

    try {
        const combinedStylePrompt = selectedStylePrompts.join(', ');
        const newPrompt = await regenerateImagePrompt(
            aiInstance,
            scene.description,
            characterDefinition,
            combinedStylePrompt,
            aspectRatio,
            generateWhisk,
            generateDreamina,
            selectedModel
        );

        setScript(prevScript => {
            if (!prevScript) return null;
            const newScenes = [...prevScript.scenes];
            newScenes[sceneIndex] = { 
                ...newScenes[sceneIndex], 
                imagePrompt: newPrompt,
                isGeneratingImages: false 
            };
            return { ...prevScript, scenes: newScenes };
        });

    } catch (err) {
        setError(lang === 'vi' ? `Lỗi tạo lại prompt: ${err instanceof Error ? err.message : "Lỗi không xác định."}` : `Prompt regeneration error: ${err instanceof Error ? err.message : "Unknown error."}`);
        setScript(prevScript => {
            if (!prevScript) return null;
            const newScenes = [...prevScript.scenes];
            newScenes[sceneIndex] = { ...newScenes[sceneIndex], isGeneratingImages: false };
            return { ...prevScript, scenes: newScenes };
        });
    }
  };


  const handleGenerateImage = async (sceneIndex: number) => {
    if (!aiInstance) {
      setError(lang === 'vi' ? 'Vui lòng nhập và lưu API Key của bạn.' : 'Please enter and save your API Key.');
      return;
    }
    if (!script || !script.scenes[sceneIndex]) return;

    setScript(prevScript => {
        if (!prevScript) return null;
        const newScenes = [...prevScript.scenes];
        newScenes[sceneIndex] = { ...newScenes[sceneIndex], isGeneratingImages: true };
        return { ...prevScript, scenes: newScenes };
    });

    try {
        const scene = script.scenes[sceneIndex];
        const generatedImagesBase64 = await generateImagesFromPrompt(aiInstance, scene.imagePrompt, aspectRatio);
        const generatedImagesDataUrls = generatedImagesBase64.map(b64 => `data:image/png;base64,${b64}`);

        setScript(prevScript => {
            if (!prevScript) return null;
            const newScenes = [...prevScript.scenes];
            const existingImages = newScenes[sceneIndex].generatedImages || [];
            newScenes[sceneIndex] = { 
                ...newScenes[sceneIndex], 
                generatedImages: [...existingImages, ...generatedImagesDataUrls],
                isGeneratingImages: false 
            };
            return { ...prevScript, scenes: newScenes };
        });
    } catch (err) {
        setError(lang === 'vi' ? `Lỗi tạo ảnh: ${err instanceof Error ? err.message : "Lỗi không xác định."}` : `Image generation error: ${err instanceof Error ? err.message : "Unknown error."}`);
        setScript(prevScript => {
            if (!prevScript) return null;
            const newScenes = [...prevScript.scenes];
            newScenes[sceneIndex] = { ...newScenes[sceneIndex], isGeneratingImages: false };
            return { ...prevScript, scenes: newScenes };
        });
    }
  };

  const handleExportProject = () => {
    const projectState: ProjectState = {
      mode, ideaInput, storyChapters, selectedStylePrompts,
      characterDefinition, aspectRatio, generateImage, generateMotion,
      generateWhisk, generateDreamina,
      includeMusic, dialogueLanguage, selectedModel, script,
    };
    const dataStr = JSON.stringify(projectState, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    const fileName = lang === 'vi' ? 'Chia Cảnh - Tạo Prompt.json' : 'Project Scene Breakdown - Prompt Gen.json';
    linkElement.setAttribute('download', fileName);
    linkElement.click();
  };

  const handleImportProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const projectState = JSON.parse(text) as Partial<ProjectState>;
        setMode(projectState.mode || 'idea');
        setIdeaInput(projectState.ideaInput || '');
        setStoryChapters(projectState.storyChapters || [{ id: `chapter-${Date.now()}`, text: '' }]);
        setSelectedStylePrompts(projectState.selectedStylePrompts || []);
        setCharacterDefinition(projectState.characterDefinition || '');
        setAspectRatio(projectState.aspectRatio || '16:9');
        setGenerateImage(projectState.generateImage !== false);
        setGenerateMotion(projectState.generateMotion !== false);
        setGenerateWhisk(projectState.generateWhisk || false);
        setGenerateDreamina(projectState.generateDreamina || false);
        setIncludeMusic(projectState.includeMusic || false);
        setDialogueLanguage(projectState.dialogueLanguage || 'Vietnamese');
        setSelectedModel(projectState.selectedModel || 'gemini-2.5-pro');
        setScript(projectState.script || null);
        alert(lang === 'vi' ? 'Dự án đã được nạp thành công!' : 'Project imported successfully!');
      } catch (err) {
        alert(lang === 'vi' ? 'Tệp dự án không hợp lệ.' : 'Invalid project file.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} t={t} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header 
        t={t} 
        currentLang={lang} 
        onLangChange={handleLangChange}
        apiKey={apiKey}
        onSaveKey={handleSaveKey}
        onDeleteKey={handleDeleteKey}
        onCoffeeClick={handleOpenCoffeeModal}
      />
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg border border-slate-700">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold text-slate-200">{t.dashboard}</h2>
          </div>
          <InputForm
            t={t} lang={lang}
            mode={mode} ideaInput={ideaInput} selectedStylePrompts={selectedStylePrompts}
            characterDefinition={characterDefinition}
            aspectRatio={aspectRatio} generateImage={generateImage} generateMotion={generateMotion}
            generateWhisk={generateWhisk} generateDreamina={generateDreamina}
            includeMusic={includeMusic} dialogueLanguage={dialogueLanguage}
            selectedModel={selectedModel} 
            generationStatus={generationStatus}
            isChatLoading={isChatLoading}
            styles={styles} aspectRatios={aspectRatios} storyChapters={storyChapters} script={script}
            setMode={setMode} setIdeaInput={setIdeaInput} setSelectedStylePrompts={setSelectedStylePrompts}
            setCharacterDefinition={setCharacterDefinition}
            setAspectRatio={setAspectRatio} setGenerateImage={setGenerateImage}
            setGenerateMotion={setGenerateMotion} setGenerateWhisk={setGenerateWhisk} setGenerateDreamina={setGenerateDreamina}
            setIncludeMusic={setIncludeMusic}
            setDialogueLanguage={setDialogueLanguage} setSelectedModel={setSelectedModel}
            setStyles={setStyles} setAspectRatios={setAspectRatios} setStoryChapters={setStoryChapters}
            onSubmit={handleGenerateScript} onExport={handleExportProject} onImport={handleImportProject}
            onGenerateCharacterDefinition={handleGenerateCharacterDefinition}
            onStopGeneration={handleStopGeneration}
          />
        </div>
        <ScriptDisplay 
          t={t} lang={lang}
          script={script} isLoading={generationStatus === 'generating'} error={error} 
          onGenerateImage={handleGenerateImage} 
          onRegenerateImagePrompt={handleRegenerateImagePrompt}
          onOpenImage={handleOpenImageModal}
          storyChapters={storyChapters}
        />
      </main>
      <footer className="text-center py-8 text-slate-500 text-sm">
        <p>
          <span className="text-green-500">{t.footer_copyright} </span>
          <span className="text-blue-500 font-bold">TIẾN DŨNG JXD</span>
        </p>
      </footer>
      <ImageModal 
        isOpen={!!modalImage} onClose={handleCloseImageModal}
        imageUrl={modalImage?.src || null} imageName={modalImage?.name || null}
      />
      <CoffeeModal 
        isOpen={isCoffeeModalOpen} 
        onClose={handleCloseCoffeeModal}
        text={t.coffee_modal_text} 
      />
    </div>
  );
};

export default App;
