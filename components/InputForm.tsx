import React, { useState, useRef } from 'react';
import type { StyleInfo, CharacterReference, StoryChapter } from '../types';
import { analyzeCharacterImage } from '../services/geminiService';

interface InputFormProps {
  apiKey: string;
  lang: 'vi' | 'en';
  mode: 'idea' | 'script';
  ideaInput: string;
  longStoryInput: string;
  chapterSplitRange: string;
  selectedStylePrompts: string[];
  characterReferences: CharacterReference[];
  characterDefinition: string;
  aspectRatio: string;
  generateImage: boolean;
  generateMotion: boolean;
  includeMusic: boolean;
  dialogueLanguage: string;
  limitCharacterCount: boolean;
  isLoading: boolean;
  isSplitting: boolean;
  isGeneratingDef: boolean;
  styles: StyleInfo[];
  aspectRatios: {name: string, value: string}[];
  storyChapters: StoryChapter[];
  splitMode: 'range' | 'number';
  numberOfChapters: string;
  
  selectedModel: string; 
  setSelectedModel: (model: string) => void;

  characterSource: 'definition' | 'references';
  setCharacterSource: (source: 'definition' | 'references') => void;

  setMode: (mode: 'idea' | 'script') => void;
  setIdeaInput: (input: string) => void;
  setLongStoryInput: (input: string) => void;
  setChapterSplitRange: (range: string) => void;
  setSelectedStylePrompts: (prompts: string[]) => void;
  setCharacterReferences: (refs: CharacterReference[] | ((prev: CharacterReference[]) => CharacterReference[])) => void;
  setCharacterDefinition: (def: string) => void;
  setAspectRatio: (ratio: string) => void;
  setGenerateImage: (value: boolean) => void;
  setGenerateMotion: (value: boolean) => void;
  setIncludeMusic: (value: boolean) => void;
  setDialogueLanguage: (lang: string) => void;
  setLimitCharacterCount: (value: boolean) => void;
  setStyles: (styles: StyleInfo[]) => void;
  setAspectRatios: (ratios: {name: string, value: string}[]) => void;
  setStoryChapters: (chapters: StoryChapter[] | ((prev: StoryChapter[]) => StoryChapter[])) => void;
  setSplitMode: (mode: 'range' | 'number') => void;
  setNumberOfChapters: (num: string) => void;

  onSubmit: () => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSplitStory: () => void;
  onGenerateCharacterDefinition: () => void;
}

const fileToBase64 = (file: File): Promise<{base64: string, type: string}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve({ base64, type: file.type });
    };
    reader.onerror = error => reject(error);
  });
};

export const defaultStyles: StyleInfo[] = [
    { name: 'Photorealistic', prompt: 'photorealistic, highly detailed realistic photo, natural lighting, soft shadows, 8K resolution, ultra-detailed, sharp focus, professional DSLR photo, high dynamic range (HDR)', definition: 'Tạo ra hình ảnh giống hệt như ảnh chụp thực tế.' },
    { name: 'Anime', prompt: 'anime style, vibrant colors, cel-shaded, Studio Ghibli inspired, detailed background art', definition: 'Phong cách nghệ thuật hoạt hình Nhật Bản.' },
    { name: '2 anh em mèo', prompt: '3D animation style, Disney Pixar style, cinematic, hyper-realistic, photorealistic, high detail, Cute anthropomorphic kitten, adorable cat, big expressive eyes, Soft lighting, warm golden hour lighting, vibrant colors', definition: 'Phong cách hoạt hình 3D dễ thương.' },
    { name: 'Cyberpunk', prompt: 'cyberpunk aesthetic, neon lights, futuristic cityscape, dystopian, Blade Runner style, rain-slicked streets', definition: 'Bối cảnh tương lai gần với công nghệ cao.' },
    { name: 'Fantasy', prompt: 'epic fantasy, magical, ethereal lighting, high fantasy art, Lord of the Rings inspired, mystical atmosphere', definition: 'Thế giới tưởng tượng, phép thuật.' },
    { name: 'Vintage', prompt: 'vintage film look, grainy texture, retro color palette, 1970s style, Kodachrome aesthetic, lens flares', definition: 'Phong cách hoài cổ.' },
];

export const defaultAspectRatios = [
    { name: 'Ngang', value: '16:9' },
    { name: 'Dọc', value: '9:16' },
    { name: 'Vuông', value: '1:1' },
    { name: 'Cổ điển', value: '4:3' },
];

// --- DANH SÁCH MODEL ---
// Cập nhật Value theo đúng mã API của Google
export const AVAILABLE_MODELS = [
    { label: 'Gemini 2.0 Flash (Experimental)', value: 'gemini-2.0-flash-exp' }, 
    { label: 'Gemini 1.5 Pro (Stable)', value: 'gemini-1.5-pro-001' },       
    { label: 'Gemini 1.5 Flash (Stable)', value: 'gemini-1.5-flash-001' },   
    { label: 'Gemini 1.5 Pro (Latest)', value: 'gemini-1.5-pro-latest' },   
];

const InputForm: React.FC<InputFormProps> = (props) => {
  const {
      apiKey, lang,
      mode, ideaInput, longStoryInput, chapterSplitRange, selectedStylePrompts, characterReferences, characterDefinition, aspectRatio,
      generateImage, generateMotion, includeMusic, dialogueLanguage, limitCharacterCount,
      isLoading, isGeneratingDef, styles, aspectRatios, storyChapters,
      splitMode, numberOfChapters,
      selectedModel, setSelectedModel, 
      characterSource, 
      setMode, setIdeaInput, setLongStoryInput, setChapterSplitRange, setSelectedStylePrompts, setCharacterReferences, setCharacterDefinition,
      setAspectRatio, setGenerateImage, setGenerateMotion, setIncludeMusic,
      setDialogueLanguage, setLimitCharacterCount, setStyles, setAspectRatios,
      setStoryChapters, setSplitMode, setNumberOfChapters,
      setCharacterSource, 
      onSubmit, onExport, onImport,
      onSplitStory, onGenerateCharacterDefinition
  } = props;
    
  const [isAddingStyle, setIsAddingStyle] = useState(false);
  const [newStyleName, setNewStyleName] = useState('');
  const [newStylePrompt, setNewStylePrompt] = useState('');
  const [isAddingAspectRatio, setIsAddingAspectRatio] = useState(false);
  const [newAspectRatioName, setNewAspectRatioName] = useState('');
  const [newAspectRatioValue, setNewAspectRatioValue] = useState('');
  const [draggedCharId, setDraggedCharId] = useState<string | null>(null);
  const [activeChapterTab, setActiveChapterTab] = useState(0);
  const importFileRef = useRef<HTMLInputElement>(null);

  // --- TỪ ĐIỂN NGÔN NGỮ ---
  const t = lang === 'vi' ? {
      styleTitle: "Phong cách (Chọn tối đa 3)",
      styleAdd: "Thêm mới +",
      styleClose: "Đóng",
      ratioTitle: "Tỉ lệ khung hình",
      ratioAdd: "Nhập +",
      manageTitle: "Quản lý Dự án & Tùy chọn Kịch bản",
      export: "Xuất Dự án (.json)",
      import: "Nạp Dự án từ File",
      selectModel: "Chọn Model AI:", 
      inputStory: "Nhập câu chuyện",
      inputPlaceholder: "Dán toàn bộ câu chuyện của bạn vào đây...",
      splitRange: "Mỗi chương:",
      chars: "ký tự",
      splitNum: "Chia thành:",
      chapters: "chương",
      splitBtn: "Chia ngay",
      scenesDone: "Đã chia cảnh",
      noChapters: "Chưa có chương nào.",
      noChaptersHint: "Nhập truyện và nhấn 'Chia ngay'.",
      charSource1: "1. Định nghĩa nhân vật (Văn bản)",
      charSource2: "2. Tham chiếu nhân vật (Hình ảnh)",
      charDefHint: "Mô tả chi tiết ngoại hình nhân vật (Tiếng Việt) để AI sử dụng.",
      autoGen: "Tự động tạo từ truyện",
      analyzing: "Đang phân tích...",
      charRefHint: "Tải ảnh nhân vật lên để AI phân tích và lấy mô tả.",
      dropImage: "Thả ảnh vào đây",
      uploadImage: "Tải/Kéo ảnh",
      analyzeAI: "Phân tích bằng AI",
      addChar: "Thêm nhân vật",
      customDetail: "Tùy chỉnh chi tiết",
      imgPrompt: "Prompt Tạo Ảnh",
      limitChar: "Chỉ tạo tối đa 3 nhân vật trong prompt tạo ảnh",
      motionPrompt: "Prompt Tạo Chuyển Động",
      createBtn: "Tạo Kịch bản & Prompts",
      createBatch: "Tạo Kịch bản (Batch)",
      music: "Bao gồm mô tả âm nhạc (Music) trong prompt.",
      dialogueLang: "Ngôn ngữ đối thoại"
  } : {
      styleTitle: "Style (Select max 3)",
      styleAdd: "Add New +",
      styleClose: "Close",
      ratioTitle: "Aspect Ratio",
      ratioAdd: "Custom +",
      manageTitle: "Project Management",
      export: "Export Project (.json)",
      import: "Import Project",
      selectModel: "Select AI Model:", 
      inputStory: "Input Story",
      inputPlaceholder: "Paste your full story here...",
      splitRange: "Per chapter:",
      chars: "chars",
      splitNum: "Split into:",
      chapters: "chapters",
      splitBtn: "Split Now",
      scenesDone: "Scenes Split",
      noChapters: "No chapters yet.",
      noChaptersHint: "Enter story and click 'Split Now'.",
      charSource1: "1. Character Definition (Text)",
      charSource2: "2. Character Reference (Image)",
      charDefHint: "Describe character appearance in detail for AI.",
      autoGen: "Auto-generate from story",
      analyzing: "Analyzing...",
      charRefHint: "Upload character images for AI analysis.",
      dropImage: "Drop image here",
      uploadImage: "Upload/Drag image",
      analyzeAI: "Analyze with AI",
      addChar: "Add Character",
      customDetail: "Detailed Settings",
      imgPrompt: "Image Prompt",
      limitChar: "Limit max 3 characters in image prompt",
      motionPrompt: "Motion Prompt",
      createBtn: "Generate Script & Prompts",
      createBatch: "Generate Script (Batch)",
      music: "Include Music description in prompt.",
      dialogueLang: "Dialogue Language"
  };

  const handleStyleClick = (prompt: string) => {
    const newSelection = [...selectedStylePrompts];
    const isSelected = newSelection.includes(prompt);
    if (isSelected) { newSelection.splice(newSelection.indexOf(prompt), 1); } 
    else { if (newSelection.length < 3) newSelection.push(prompt); else alert(lang==='vi'?"Bạn chỉ có thể chọn tối đa 3 phong cách.":"Max 3 styles allowed."); }
    setSelectedStylePrompts(newSelection);
  };
  const handleSaveStyle = () => {
    if (!newStyleName.trim() || !newStylePrompt.trim()) return;
    const newStyle: StyleInfo = { name: newStyleName.trim(), prompt: newStylePrompt.trim(), definition: 'Custom style.' };
    const updatedStyles = [...styles, newStyle];
    setStyles(updatedStyles); handleStyleClick(newStyle.prompt);
    localStorage.setItem('customVideoStyles', JSON.stringify(updatedStyles.filter(s => !defaultStyles.some(ds => ds.name === s.name))));
    setNewStyleName(''); setNewStylePrompt(''); setIsAddingStyle(false);
  };
  const handleSaveAspectRatio = () => {
    if (!newAspectRatioName.trim() || !newAspectRatioValue.trim()) return;
    const newRatio = { name: newAspectRatioName.trim(), value: newAspectRatioValue.trim() };
    const updatedRatios = [...aspectRatios, newRatio];
    setAspectRatios(updatedRatios); setAspectRatio(newRatio.value);
    localStorage.setItem('customVideoRatios', JSON.stringify(updatedRatios.filter(r => !defaultAspectRatios.some(dr => dr.value === r.value))));
    setNewAspectRatioName(''); setNewAspectRatioValue(''); setIsAddingAspectRatio(false);
  };
  const handleAddCharacter = () => {
    if (characterReferences.length < 5) {
      setCharacterReferences([...characterReferences, { id: `char-${Date.now()}`, name: `${lang==='vi'?'Nhân vật':'Character'} ${characterReferences.length + 1}`, imageBase64: null, fileType: null, description: '', isAnalyzing: false }]);
    }
  };
  const handleCharacterUpdate = (id: string, field: keyof CharacterReference, value: any) => {
    setCharacterReferences(prev => prev.map(char => (char.id === id ? { ...char, [field]: value } : char)));
  };
  const handleImageUpload = async (id: string, file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert("Chỉ chấp nhận ảnh."); return; }
    try {
      const { base64, type } = await fileToBase64(file);
      setCharacterReferences(prev => prev.map(char => (char.id === id ? { ...char, imageBase64: base64, fileType: type } : char)));
    } catch (error) { console.error(error); }
  };
  const handleAnalyze = async (id: string) => {
    const character = characterReferences.find(c => c.id === id);
    if (!character || !character.imageBase64) { alert(lang==='vi'?"Chưa có ảnh.":"No image."); return; }
    handleCharacterUpdate(id, 'isAnalyzing', true);
    try {
      const description = await analyzeCharacterImage(character.imageBase64, character.fileType!, apiKey, selectedModel);
      handleCharacterUpdate(id, 'description', description);
    } catch (error) { alert(error instanceof Error ? error.message : "Lỗi"); } 
    finally { handleCharacterUpdate(id, 'isAnalyzing', false); }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((ideaInput.trim() || storyChapters.some(c => c.text.trim())) && !isLoading) onSubmit();
  };
  const handleAddChapter = () => {
    setStoryChapters(prev => [...prev, { id: `chapter-${Date.now()}`, text: '' }]);
    setActiveChapterTab(storyChapters.length);
  };
  const handleChapterTextChange = (id: string, text: string) => {
    setStoryChapters(prev => prev.map(ch => ch.id === id ? { ...ch, text } : ch));
  };
  const handleDeleteActiveChapter = () => {
      if (storyChapters.length === 0) return;
      const newChapters = storyChapters.filter((_, index) => index !== activeChapterTab);
      setStoryChapters(newChapters);
      if (activeChapterTab >= newChapters.length) { setActiveChapterTab(Math.max(0, newChapters.length - 1)); }
  };

  const isSubmitDisabled = isLoading || (ideaInput.trim() === '' && !storyChapters.some(c => c.text.trim())) || (!generateImage && !generateMotion);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       {/* 1. PHONG CÁCH & TỈ LỆ */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div>
          <label className="text-[20px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-3 block">{t.styleTitle}</label>
          <div className="flex flex-wrap gap-3 items-center">
            {styles.map((style) => (
              <div key={style.name} className="relative group">
                <button type="button" onClick={() => handleStyleClick(style.prompt)}
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${ selectedStylePrompts.includes(style.prompt) ? 'bg-yellow-500 text-slate-900 ring-2 ring-yellow-300' : 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/40' }`}
                >{style.name}</button>
                 <div className="absolute bottom-full mb-2 w-72 p-3 bg-slate-700 text-slate-200 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 left-1/2 -translate-x-1/2 invisible group-hover:visible">
                  {style.definition}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-700"></div>
                </div>
              </div>
            ))}
            <button type="button" onClick={() => setIsAddingStyle(!isAddingStyle)} className="px-3 py-2 text-sm font-semibold rounded-full bg-slate-700 hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500">
              {isAddingStyle ? t.styleClose : t.styleAdd}
            </button>
          </div>
          {isAddingStyle && (
              <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-3">
                  <input type="text" value={newStyleName} onChange={(e) => setNewStyleName(e.target.value)} placeholder="Name (e.g. Dark Ghibli)" className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500" />
                  <textarea rows={2} value={newStylePrompt} onChange={(e) => setNewStylePrompt(e.target.value)} placeholder="Prompt (e.g. dark fantasy, moody...)" className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500" />
                  <button type="button" onClick={handleSaveStyle} className="px-4 py-2 text-sm font-medium rounded-md bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500">Save</button>
              </div>
          )}
        </div>
        <div>
          <label className="text-[20px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-3 block">{t.ratioTitle}</label>
           <div className="flex flex-wrap gap-3 items-center">
            {aspectRatios.map((ratio) => (
              <button key={ratio.value} type="button" onClick={() => setAspectRatio(ratio.value)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${ aspectRatio === ratio.value ? 'bg-purple-500 text-slate-900 ring-2 ring-purple-300' : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/40' }`}
              >{ratio.name} ({ratio.value})</button>
            ))}
            <button type="button" onClick={() => setIsAddingAspectRatio(!isAddingAspectRatio)} className="px-3 py-2 text-sm font-semibold rounded-full bg-slate-700 hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500">
              {isAddingAspectRatio ? t.styleClose : t.ratioAdd}
            </button>
          </div>
          {isAddingAspectRatio && (
              <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-3">
                  <input type="text" value={newAspectRatioName} onChange={(e) => setNewAspectRatioName(e.target.value)} placeholder="Name (e.g. Ultrawide)" className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:ring-1 focus:ring-purple-500" />
                  <input type="text" value={newAspectRatioValue} onChange={(e) => setNewAspectRatioValue(e.target.value)} placeholder="Ratio (e.g. 21:9)" className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:ring-1 focus:ring-purple-500" />
                  <button type="button" onClick={handleSaveAspectRatio} className="px-4 py-2 text-sm font-medium rounded-md bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500">Save</button>
              </div>
          )}
        </div>
      </div>
       
      {/* 2. QUẢN LÝ DỰ ÁN & CHỌN MODEL */}
      <div className="mt-6">
            <h3 className="text-sm font-medium text-slate-300 mb-2">{t.manageTitle}</h3>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                    <button type="button" onClick={onExport} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        {t.export}
                    </button>
                    <input type="file" ref={importFileRef} className="hidden" accept=".json" onChange={onImport} />
                    <button type="button" onClick={() => importFileRef.current?.click()} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        {t.import}
                    </button>
                </div>

                {/* KHU VỰC CHỌN MODEL */}
                <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 p-1.5 rounded-lg">
                    <label htmlFor="model-select" className="text-sm font-bold text-yellow-500 whitespace-nowrap px-2">{t.selectModel}</label>
                    <select
                        id="model-select"
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="bg-slate-700 border border-slate-600 text-slate-200 text-sm rounded-md focus:ring-cyan-500 focus:border-cyan-500 block p-2 min-w-[180px]"
                    >
                        {AVAILABLE_MODELS.map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

      {/* 3. KHU VỰC NHẬP LIỆU CHÍNH */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-6 pt-6 border-t border-slate-700">
        <div className="flex flex-col h-full">
          <label htmlFor="long-story-input" className="block text-[17px] font-bold text-yellow-400 mb-2">{t.inputStory}</label>
          <textarea
              id="long-story-input"
              value={longStoryInput}
              onChange={(e) => setLongStoryInput(e.target.value)}
              placeholder={t.inputPlaceholder}
              className="w-full flex-grow bg-slate-800 border border-slate-600 rounded-lg p-3 text-sm text-slate-200 focus:ring-2 focus:ring-yellow-500 resize-none min-h-[300px]"
              disabled={isLoading}
          />
          <div className="mt-3 flex flex-wrap items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700 gap-3">
                <div className="flex items-center space-x-4 flex-wrap">
                    <div className="flex items-center">
                        <input type="radio" id="split-by-range" name="split-mode" value="range" checked={splitMode === 'range'} onChange={() => setSplitMode('range')} className="h-4 w-4 text-yellow-500 bg-slate-700 border-slate-600 focus:ring-yellow-600" />
                        <label htmlFor="split-by-range" className="ml-2 flex items-center text-sm font-medium text-slate-300">
                            {t.splitRange} <input type="number" value={chapterSplitRange} onChange={(e) => setChapterSplitRange(e.target.value)} className="mx-1 w-16 bg-slate-700 border border-slate-600 rounded px-1 py-0.5 text-center focus:ring-1 focus:ring-yellow-500 disabled:opacity-50" disabled={isLoading || splitMode !== 'range'} /> {t.chars}
                        </label>
                    </div>
                    <div className="flex items-center">
                        <input type="radio" id="split-by-number" name="split-mode" value="number" checked={splitMode === 'number'} onChange={() => setSplitMode('number')} className="h-4 w-4 text-yellow-500 bg-slate-700 border-slate-600 focus:ring-yellow-600" />
                        <label htmlFor="split-by-number" className="ml-2 flex items-center text-sm font-medium text-slate-300">
                            {t.splitNum} <input type="number" value={numberOfChapters} onChange={(e) => setNumberOfChapters(e.target.value)} className="mx-1 w-12 bg-slate-700 border border-slate-600 rounded px-1 py-0.5 text-center focus:ring-1 focus:ring-yellow-500 disabled:opacity-50" disabled={isLoading || splitMode !== 'number'} min="1" /> {t.chapters}
                        </label>
                    </div>
                </div>
                <button type="button" onClick={onSplitStory} disabled={isLoading || !longStoryInput.trim()} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-900 text-sm font-bold rounded-md transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
                    {t.splitBtn}
                </button>
          </div>
        </div>

        <div className="space-y-4 flex flex-col h-full">
          <div className="flex justify-between items-start">
            <label className="block text-[17px] font-bold text-yellow-400">{t.scenesDone}</label>
            <div className="flex items-center space-x-2 flex-shrink-0">
                <button type="button" onClick={handleDeleteActiveChapter} disabled={isLoading || storyChapters.length === 0} className="p-1.5 text-red-400 hover:bg-red-900/30 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
                <button type="button" onClick={handleAddChapter} disabled={isLoading} className="p-2 bg-yellow-500 text-slate-900 rounded-full hover:bg-yellow-600 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                </button>
            </div>
          </div>
          
          <div className="flex-grow flex flex-col border border-slate-700 rounded-lg overflow-hidden bg-slate-800/50 h-full min-h-[420px]">
             {storyChapters.length > 0 ? (
                <>
                    <div className="flex overflow-x-auto border-b border-slate-700 bg-slate-900/50 scrollbar-hide">
                        {storyChapters.map((chapter, index) => (
                            <button
                                key={chapter.id}
                                type="button"
                                onClick={() => setActiveChapterTab(index)}
                                className={`flex-shrink-0 px-4 py-3 text-xs font-bold uppercase tracking-wider border-r border-slate-700/50 transition-colors ${activeChapterTab === index ? 'bg-slate-800 text-cyan-400 border-t-2 border-t-cyan-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'}`}
                            >
                                {lang === 'vi' ? 'Chương' : 'Chapter'} {index + 1}
                            </button>
                        ))}
                    </div>
                    <div className="p-4 flex-grow flex flex-col">
                        <textarea 
                            value={storyChapters[activeChapterTab]?.text || ''} 
                            onChange={(e) => handleChapterTextChange(storyChapters[activeChapterTab].id, e.target.value)}
                            placeholder={lang === 'vi' ? `Nội dung chương ${activeChapterTab + 1}...` : `Content for chapter ${activeChapterTab + 1}...`}
                            className="w-full h-full bg-slate-800 border border-slate-600 rounded-md p-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 resize-none" 
                            disabled={isLoading}
                        />
                        <div className="text-right text-xs text-slate-400 mt-2">
                          {storyChapters[activeChapterTab]?.text.length || 0} {t.chars}
                        </div>
                    </div>
                </>
             ) : (
                <div className="flex items-center justify-center h-full text-slate-500 flex-col">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    <p>{t.noChapters}</p>
                    <p className="text-xs mt-1">{t.noChaptersHint}</p>
                </div>
             )}
          </div>
        </div>
      </div>

      {/* 4. GIAO DIỆN NHÂN VẬT */}
      <div className="mt-8">
        <div className="flex border-b border-slate-700 mb-4">
            <button type="button" onClick={() => setCharacterSource('definition')} className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${characterSource === 'definition' ? 'border-green-500 text-green-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
                {t.charSource1}
            </button>
            <button type="button" onClick={() => setCharacterSource('references')} className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${characterSource === 'references' ? 'border-green-500 text-green-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}>
                {t.charSource2}
            </button>
        </div>

        <div className="min-h-[300px]">
            <div className={characterSource === 'definition' ? 'block' : 'hidden'}>
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-slate-400">{t.charDefHint}</span>
                    <button type="button" onClick={onGenerateCharacterDefinition} disabled={isLoading || isGeneratingDef || !storyChapters.some(c => c.text.trim())} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-bold rounded-md text-slate-900 bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-500 disabled:cursor-not-allowed">
                        {isGeneratingDef ? t.analyzing : t.autoGen}
                    </button>
                </div>
                <textarea rows={12} value={characterDefinition} onChange={(e) => setCharacterDefinition(e.target.value)} placeholder="Ví dụ: Haruka Sato: 70 tuổi, tóc bạc búi cao, mắt nâu hiền từ..." className="w-full bg-slate-800/50 border border-green-500/50 rounded-lg p-4 text-sm text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors" disabled={isLoading} />
            </div>

            <div className={characterSource === 'references' ? 'block' : 'hidden'}>
                <div className="mb-3 text-sm text-slate-400">{t.charRefHint}</div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4 rounded-lg border border-green-500/50 bg-slate-800/20">
                  {characterReferences.map((char) => (
                    <div key={char.id} className="bg-slate-800 p-4 border border-slate-700 rounded-lg space-y-3">
                      <input type="text" value={char.name} onChange={(e) => handleCharacterUpdate(char.id, 'name', e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm font-semibold text-slate-200 focus:ring-1 focus:ring-green-500" disabled={isLoading}/>
                      <div className={`relative w-full h-40 bg-slate-700 rounded-md flex items-center justify-center border-2 border-dashed transition-colors ${draggedCharId === char.id ? 'border-cyan-500 bg-slate-600' : 'border-slate-600'}`} onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDraggedCharId(char.id); }} onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDraggedCharId(null); }} onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setDraggedCharId(null); const file = e.dataTransfer.files?.[0]; if (file) handleImageUpload(char.id, file); }}>
                        {draggedCharId === char.id && <div className="absolute inset-0 bg-cyan-500/30 flex items-center justify-center pointer-events-none z-10"><p className="text-cyan-200 font-semibold">{t.dropImage}</p></div>}
                        {char.imageBase64 ? (
                          <>
                            <img src={`data:${char.fileType};base64,${char.imageBase64}`} alt="Preview" className="object-contain h-full w-full rounded-md"/>
                            <button type="button" onClick={() => handleCharacterUpdate(char.id, 'imageBase64', null)} className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-500 text-white rounded-full p-1 z-20" disabled={isLoading}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                          </>
                        ) : (
                          <label className="cursor-pointer text-center text-slate-400 p-4 w-full h-full flex flex-col items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span className="text-xs">{t.uploadImage}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(char.id, e.target.files?.[0] || null)} disabled={isLoading}/>
                          </label>
                        )}
                      </div>
                      <button type="button" onClick={() => handleAnalyze(char.id)} disabled={!char.imageBase64 || char.isAnalyzing || isLoading} className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:bg-slate-500">
                        {char.isAnalyzing ? t.analyzing : t.analyzeAI}
                      </button>
                      <textarea rows={4} value={char.description} onChange={(e) => handleCharacterUpdate(char.id, 'description', e.target.value)} placeholder="AI description..." className="w-full bg-yellow-500/10 border border-yellow-500/30 rounded-md p-2 text-sm text-yellow-200 focus:ring-1 focus:ring-yellow-400" disabled={isLoading}/>
                    </div>
                  ))}
                  {characterReferences.length < 5 && (
                     <button type="button" onClick={handleAddCharacter} className="w-full h-full bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:bg-slate-700/50 transition-colors min-h-[150px]" disabled={isLoading}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        <span className="mt-2 text-sm font-medium">{t.addChar}</span>
                     </button>
                  )}
                </div>
            </div>
        </div>
      </div>
       
      {/* 5. CÁC TÙY CHỌN CUỐI */}
      <div className="mt-6 pt-2 p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-200">{t.customDetail}</h3>
            <div className="flex items-center space-x-6">
              <div className="flex items-center"><input type="checkbox" id="image-prompt-toggle" checked={generateImage} onChange={(e) => setGenerateImage(e.target.checked)} className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-cyan-400 focus:ring-cyan-500" /><label htmlFor="image-prompt-toggle" className="ml-3 block text-sm font-medium text-slate-200">{t.imgPrompt}</label></div>
              <div className="flex items-center">
                <input type="checkbox" id="limit-char-toggle" checked={limitCharacterCount} onChange={(e) => setLimitCharacterCount(e.target.checked)} className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-cyan-400 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={generateMotion} />
                <label htmlFor="limit-char-toggle" className={`ml-3 block text-sm font-medium transition-colors ${generateMotion ? 'text-slate-500' : 'text-slate-200'}`}>{t.limitChar}</label>
              </div>
              <div className="flex items-center"><input type="checkbox" id="motion-prompt-toggle" checked={generateMotion} onChange={(e) => setGenerateMotion(e.target.checked)} className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-cyan-400 focus:ring-cyan-500" /><label htmlFor="motion-prompt-toggle" className="ml-3 block text-sm font-medium text-slate-200">{t.motionPrompt}</label></div>
            </div>
            <button type="submit" disabled={isSubmitDisabled} className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-all">
              {isLoading ? <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>{storyChapters.length > 0 && !isSubmitDisabled ? t.createBatch : t.createBtn}</> : t.createBtn}
            </button>
          </div>
          <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">{t.music}</span>
              <label htmlFor="music-toggle" className="flex items-center cursor-pointer"><div className="relative"><input type="checkbox" id="music-toggle" className="sr-only" checked={includeMusic} onChange={e => setIncludeMusic(e.target.checked)}/><div className={`block w-14 h-8 rounded-full transition-colors ${includeMusic ? 'bg-green-500 ring-2 ring-green-400 ring-offset-2 ring-offset-slate-800' : 'bg-slate-600'}`}></div><div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${includeMusic ? 'transform translate-x-6' : ''}`}></div></div></label>
          </div>
          <div className="flex items-center justify-between">
              <label htmlFor="dialogue-language" className="flex items-center text-sm font-medium text-slate-300">{t.dialogueLang}</label>
              <input type="text" id="dialogue-language" value={dialogueLanguage} onChange={(e) => setDialogueLanguage(e.target.value)} placeholder="e.g. English, Spanish..." className="w-48 bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 placeholder-slate-400" />
          </div>
      </div>
    </form>
  );
};

export default InputForm;