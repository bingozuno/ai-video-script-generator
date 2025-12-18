
import React, { useState, useRef, useEffect } from 'react';
import type { Script, StyleInfo, StoryChapter } from '../types';


type GenerationStatus = 'idle' | 'generating' | 'done';
interface InputFormProps {
  t: any;
  lang: string;
  // State props
  mode: 'idea' | 'script';
  ideaInput: string;
  selectedStylePrompts: string[];
  characterDefinition: string;
  aspectRatio: string;
  generateImage: boolean;
  generateMotion: boolean;

  generateWhisk: boolean;
  generateDreamina: boolean;
  includeMusic: boolean;
  dialogueLanguage: string;
  selectedModel: string;
  generationStatus: GenerationStatus;
  isChatLoading: boolean;
  styles: StyleInfo[];
  aspectRatios: {name: string, value: string}[];
  storyChapters: StoryChapter[];
  script: Script | null;

  // Handler props
  setMode: (mode: 'idea' | 'script') => void;
  setIdeaInput: (input: string) => void;
  setSelectedStylePrompts: (prompts: string[]) => void;
  setCharacterDefinition: (def: string) => void;
  setAspectRatio: (ratio: string) => void;
  setGenerateImage: (value: boolean) => void;
  setGenerateMotion: (value: boolean) => void;
  setGenerateWhisk: (value: boolean) => void;
  setGenerateDreamina: (value: boolean) => void;
  setIncludeMusic: (value: boolean) => void;
  setDialogueLanguage: (lang: string) => void;
  setSelectedModel: (model: string) => void;
  setStyles: (styles: StyleInfo[]) => void;
  setAspectRatios: (ratios: {name: string, value: string}[]) => void;
  setStoryChapters: (chapters: StoryChapter[] | ((prev: StoryChapter[]) => StoryChapter[])) => void;

  // Action props
  onSubmit: () => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateCharacterDefinition: () => void;
  onStopGeneration: () => void;
  // FIX: Add missing onClearPrompts prop to fix TypeScript error.
  onClearPrompts: () => void;
}

export const defaultStyles: StyleInfo[] = [
    { name: 'Photorealistic', prompt: 'photorealistic, highly detailed realistic photo, natural lighting, soft shadows, 8K resolution, ultra-detailed, sharp focus, professional DSLR photo, high dynamic range (HDR)', definition: 'Tạo ra hình ảnh giống hệt như ảnh chụp thực tế từ máy ảnh chuyên nghiệp, tập trung vào tính chân thực, chi tiết cao.' },
    { name: 'Anime', prompt: 'anime style, vibrant colors, cel-shaded, Studio Ghibli inspired, detailed background art', definition: 'Phong cách nghệ thuật hoạt hình Nhật Bản, với đặc trưng phóng đại, màu sắc rực rỡ và biểu cảm cảm xúc mạnh mẽ.' },
    { name: 'Cyberpunk', prompt: 'cyberpunk aesthetic, neon lights, futuristic cityscape, dystopian, Blade Runner style, rain-slicked streets', definition: 'Bối cảnh tương lai gần với công nghệ cao nhưng xã hội thấp kém (high-tech, low-life).' },
    { name: 'Fantasy', prompt: 'epic fantasy, magical, ethereal lighting, high fantasy art, Lord of the Rings inspired, mystical atmosphere', definition: 'Lấy cảm hứng từ thế giới tưởng tượng, bao gồm các yếu tố huyền bí, phép thuật và sinh vật huyền thoại.' },
    { name: 'Vintage', prompt: 'vintage style, muted colors, earthy tones, aged textures, grainy, faded, nostalgic atmosphere, high detail', definition: 'Tạo ảnh lấy cảm hứng từ các thời kỳ quá khứ (cuối thế kỷ 19 đến giữa thế kỷ 20), nhấn mạnh vào sự hoài cổ và các yếu tố đại diện cho một era cụ thể.' },
];

export const defaultAspectRatios = [
    { name: 'Ngang', value: '16:9' },
    { name: 'Dọc', value: '9:16' },
    { name: 'Vuông', value: '1:1' },
    { name: 'Cổ điển', value: '4:3' },
];

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
    const [isCopied, setIsCopied] = useState(false);
    const handleCopy = async () => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 bg-slate-700/50 rounded-md text-slate-300 hover:bg-slate-600/50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
            aria-label="Copy code"
        >
            {isCopied ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            )}
        </button>
    );
};

const InputForm: React.FC<InputFormProps> = (props) => {
  const {
      t, lang,
      mode, ideaInput, selectedStylePrompts, characterDefinition, aspectRatio,
      generateImage, generateMotion, generateWhisk, generateDreamina,
      includeMusic, dialogueLanguage, selectedModel,
      generationStatus, isChatLoading, styles, aspectRatios, storyChapters, script,
      setMode, setIdeaInput, setSelectedStylePrompts, setCharacterDefinition,
      setAspectRatio, setGenerateImage, setGenerateMotion, setGenerateWhisk, setGenerateDreamina,
      setIncludeMusic,
      setDialogueLanguage, setSelectedModel, setStyles, setAspectRatios,
      setStoryChapters,
      onSubmit, onExport, onImport,
      onGenerateCharacterDefinition, onStopGeneration, onClearPrompts
  } = props;
    
  const [isAddingStyle, setIsAddingStyle] = useState(false);
  const [newStyleName, setNewStyleName] = useState('');
  const [newStylePrompt, setNewStylePrompt] = useState('');

  const [isAddingAspectRatio, setIsAddingAspectRatio] = useState(false);
  const [newAspectRatioName, setNewAspectRatioName] = useState('');
  const [newAspectRatioValue, setNewAspectRatioValue] = useState('');
  
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [splitMode, setSplitMode] = useState<'length' | 'count'>('length');
  const [splitLength, setSplitLength] = useState<string>('1000');
  const [splitCount, setSplitCount] = useState<string>('5');

  const importFileRef = useRef<HTMLInputElement>(null);
  const isLoading = generationStatus === 'generating';

  useEffect(() => {
    if (storyChapters.length > 0 && !activeChapterId) {
      setActiveChapterId(storyChapters[0].id);
    }
  }, [storyChapters]);

  const handleStyleClick = (prompt: string) => {
    const newSelection = [...selectedStylePrompts];
    const isSelected = newSelection.includes(prompt);

    if (isSelected) {
        const index = newSelection.indexOf(prompt);
        newSelection.splice(index, 1);
    } else {
        if (newSelection.length < 3) {
            newSelection.push(prompt);
        } else {
            alert(lang === 'vi' ? "Bạn chỉ có thể chọn tối đa 3 phong cách." : "You can select up to 3 styles.");
        }
    }
    setSelectedStylePrompts(newSelection);
  };

  const handleSaveStyle = () => {
    if (!newStyleName.trim() || !newStylePrompt.trim()) return;
    const newStyle: StyleInfo = { name: newStyleName.trim(), prompt: newStylePrompt.trim(), definition: 'Phong cách tùy chỉnh.' };
    const updatedStyles = [...styles, newStyle];
    setStyles(updatedStyles);
    handleStyleClick(newStyle.prompt);
    const customStyles = updatedStyles.filter(s => !defaultStyles.some(ds => ds.name === s.name));
    localStorage.setItem('customVideoStyles', JSON.stringify(customStyles));
    setNewStyleName('');
    setNewStylePrompt('');
    setIsAddingStyle(false);
  };

  const handleSaveAspectRatio = () => {
    if (!newAspectRatioName.trim() || !newAspectRatioValue.trim()) return;
    const newRatio = { name: newAspectRatioName.trim(), value: newAspectRatioValue.trim() };
    const updatedRatios = [...aspectRatios, newRatio];
    setAspectRatios(updatedRatios);
    setAspectRatio(newRatio.value);
    const customRatios = updatedRatios.filter(r => !defaultAspectRatios.some(dr => dr.value === r.value));
    localStorage.setItem('customVideoRatios', JSON.stringify(customRatios));
    setNewAspectRatioName('');
    setNewAspectRatioValue('');
    setIsAddingAspectRatio(false);
  };

  const handleMainButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (generationStatus === 'generating') {
        onStopGeneration();
    } else {
        onSubmit();
    }
  };
  
  const handleAddChapter = () => {
    if (storyChapters.length < 12) {
      const newId = `chapter-${Date.now()}`;
      setStoryChapters(prev => [
        ...prev,
        { id: newId, text: '' }
      ]);
      setActiveChapterId(newId);
    }
  };

  const handleDeleteChapter = () => {
    if (storyChapters.length <= 1) return;
    const currentIndex = storyChapters.findIndex(c => c.id === activeChapterId);
    const newChapters = storyChapters.filter(c => c.id !== activeChapterId);
    setStoryChapters(newChapters);
    const nextIndex = Math.max(0, currentIndex - 1);
    setActiveChapterId(newChapters[nextIndex].id);
  };

  const handleChapterTextChange = (id: string, text: string) => {
    setStoryChapters(prev => prev.map(ch => ch.id === id ? { ...ch, text } : ch));
  };

  const splitIntoChunks = (text: string, targetSize: number) => {
    const chunks: string[] = [];
    let remainingText = text;

    while (remainingText.length > 0) {
      if (remainingText.length <= targetSize + 200) {
        chunks.push(remainingText.trim());
        break;
      }

      let splitIndex = targetSize;
      const punctuationRegex = /[.!?]/g;
      let bestIndex = -1;
      
      const startRange = Math.max(0, targetSize - 200);
      const endRange = Math.min(remainingText.length, targetSize + 200);
      const searchArea = remainingText.substring(startRange, endRange);
      
      let match;
      while ((match = punctuationRegex.exec(searchArea)) !== null) {
          const absoluteMatchPos = startRange + match.index + 1;
          if (bestIndex === -1 || Math.abs(absoluteMatchPos - targetSize) < Math.abs(bestIndex - targetSize)) {
              bestIndex = absoluteMatchPos;
          }
      }

      if (bestIndex === -1) {
        bestIndex = targetSize;
      }

      chunks.push(remainingText.substring(0, bestIndex).trim());
      remainingText = remainingText.substring(bestIndex).trim();
    }
    return chunks;
  };

  const handleSplitNow = () => {
    if (!ideaInput.trim()) return;
    const text = ideaInput.trim();
    let resultTexts: string[] = [];

    if (splitMode === 'length') {
      const len = parseInt(splitLength) || 1000;
      resultTexts = splitIntoChunks(text, len);
    } else {
      const count = parseInt(splitCount) || 5;
      const targetLen = Math.floor(text.length / count);
      resultTexts = splitIntoChunks(text, targetLen);
      // Limit if it exceeds count slightly due to period finding logic
      if (resultTexts.length > count) {
          const extra = resultTexts.slice(count).join(' ');
          resultTexts = resultTexts.slice(0, count);
          resultTexts[count - 1] += ' ' + extra;
      }
    }

    if (resultTexts.length > 0) {
      const newChapters = resultTexts.map((txt, i) => ({
        id: `chapter-${Date.now()}-${i}`,
        text: txt
      }));
      setStoryChapters(newChapters);
      setActiveChapterId(newChapters[0].id);
    }
  };
  
  const getTranslatedAspectRatioName = (ratio: {name: string, value: string}, t: any) => {
    const keyMap: {[key: string]: string} = {
      'Ngang': 'ar_horizontal',
      'Dọc': 'ar_vertical',
      'Vuông': 'ar_square',
      'Cổ điển': 'ar_classic'
    };
    const key = keyMap[ratio.name];
    return key ? t[key] : ratio.name;
  };

  const activeChapter = storyChapters.find(c => c.id === activeChapterId) || storyChapters[0];

  const handleToggleOption = (option: 'image' | 'motion' | 'whisk' | 'dreamina') => {
    const optionValues = { image: generateImage, motion: generateMotion, whisk: generateWhisk, dreamina: generateDreamina };
    const optionSetters = { image: setGenerateImage, motion: setGenerateMotion, whisk: setGenerateWhisk, dreamina: setGenerateDreamina };
    
    const isActivating = !optionValues[option];
    const activeCount = Object.values(optionValues).filter(Boolean).length;

    if (isActivating) {
        // Rule: Can't activate if 3 are already active, unless we're swapping whisk/dreamina
        if (activeCount >= 3) {
            if (!((option === 'whisk' && optionValues.dreamina) || (option === 'dreamina' && optionValues.whisk))) {
                 return;
            }
        }
        
        // Rule: Whisk and Dreamina are mutually exclusive. Turning one on turns the other off.
        if (option === 'whisk' && optionValues.dreamina) {
            setGenerateDreamina(false);
        } else if (option === 'dreamina' && optionValues.whisk) {
            setGenerateWhisk(false);
        }
        
        optionSetters[option](true);
    } else {
        // Deactivating is always allowed.
        optionSetters[option](false);
    }
  };

  const isGenerationStartDisabled = isLoading || (ideaInput.trim() === '' && !storyChapters.some(c => c.text.trim()));

  const getButtonText = () => {
    switch (generationStatus) {
        case 'generating':
            return `${t.submitting_btn} (${t.stop_btn})`;
        case 'done':
        case 'idle':
        default:
            return t.submit_btn;
    }
  };

  return (
    <form className="space-y-6">
       <style dangerouslySetInnerHTML={{ __html: `
        @keyframes subtle-shake {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-4deg) scale(1.05); }
          75% { transform: rotate(4deg) scale(1.05); }
        }
        .shaking-hourglass {
          animation: subtle-shake 0.4s ease-in-out infinite;
        }
      `}} />
       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div>
          <label className="text-[20px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-3 block">{t.style_label}</label>
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
              {isAddingStyle ? t.style_close : t.style_add}
            </button>
          </div>
          {isAddingStyle && (
              <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-3">
                  <input type="text" value={newStyleName} onChange={(e) => setNewStyleName(e.target.value)} placeholder={t.style_placeholder} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500" />
                  <textarea rows={2} value={newStylePrompt} onChange={(e) => setNewStylePrompt(e.target.value)} placeholder={t.style_prompt_placeholder} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500" />
                  <button type="button" onClick={handleSaveStyle} className="px-4 py-2 text-sm font-medium rounded-md bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500">{t.style_save}</button>
              </div>
          )}
        </div>
        
        <div>
          <label className="text-[20px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-3 block">{t.aspect_ratio_label}</label>
           <div className="flex flex-wrap gap-3 items-center">
            {aspectRatios.map((ratio) => (
              <button key={ratio.value} type="button" onClick={() => setAspectRatio(ratio.value)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${ aspectRatio === ratio.value ? 'bg-purple-500 text-slate-900 ring-2 ring-purple-300' : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/40' }`}
              >{getTranslatedAspectRatioName(ratio, t)} ({ratio.value})</button>
            ))}
            <button type="button" onClick={() => setIsAddingAspectRatio(!isAddingAspectRatio)} className="px-3 py-2 text-sm font-semibold rounded-full bg-slate-700 hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500">
              {isAddingAspectRatio ? t.style_close : t.aspect_ratio_input}
            </button>
          </div>
          {isAddingAspectRatio && (
              <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-3">
                  <input type="text" value={newAspectRatioName} onChange={(e) => setNewAspectRatioName(e.target.value)} placeholder="Tên tỉ lệ" className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:ring-1 focus:ring-purple-500" />
                  <input type="text" value={newAspectRatioValue} onChange={(e) => setNewAspectRatioValue(e.target.value)} placeholder="Ví dụ: 16:9" className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:ring-1 focus:ring-purple-500" />
                  <button type="button" onClick={handleSaveAspectRatio} className="px-4 py-2 text-sm font-medium rounded-md bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500">{t.aspect_ratio_save}</button>
              </div>
          )}
        </div>
      </div>
      
       <div className="mt-6">
            <h3 className="text-sm font-medium text-slate-300 mb-2">{t.project_mgmt}</h3>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <button
                        type="button"
                        onClick={onExport}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        {t.export_project}
                    </button>
                    <input
                        type="file"
                        ref={importFileRef}
                        className="hidden"
                        accept=".json"
                        onChange={onImport}
                    />
                    <button
                        type="button"
                        onClick={() => importFileRef.current?.click()}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-semibold rounded-md text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        {t.import_project}
                    </button>
                </div>
                <div className="flex items-center space-x-2">
                    <label htmlFor="model-select" className="text-sm font-medium text-slate-300 whitespace-nowrap">{t.model_label}</label>
                    <select
                      id="model-select"
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-48 bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500"
                      disabled={isLoading}
                    >
                      <option value="gemini-3-pro-preview">Gemini 3 Pro Preview</option>
                      <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    </select>
                </div>
            </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-6 pt-6 border-t border-slate-700">
        <div>
          <label htmlFor="idea-input" className="block text-[17px] font-bold text-yellow-400 mb-2">{t.idea_input_label}</label>
            <div className="w-full bg-slate-800/40 border border-slate-700 rounded-lg transition-colors h-[420px] flex flex-col p-4 relative group hover:border-slate-600">
                 <CopyButton text={ideaInput} />
                 <textarea
                    id="idea-input"
                    value={ideaInput}
                    onChange={(e) => setIdeaInput(e.target.value)}
                    placeholder={t.idea_placeholder}
                    className="w-full h-full bg-transparent border-none focus:ring-0 text-slate-200 resize-none p-0 text-sm leading-relaxed"
                    disabled={isLoading}
                 />
                 <div className="absolute bottom-4 right-4 text-[11px] text-slate-500 font-medium">
                    {ideaInput.length} {t.char_count}
                </div>
            </div>
            
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-800/50">
                <div className="relative w-[460px] h-[44px] bg-slate-900/50 rounded-lg p-1 flex items-center border border-slate-700">
                    <div 
                        className={`absolute top-1 left-1 h-[34px] w-[calc(50%-4px)] bg-cyan-600 rounded-md transition-transform duration-300 ease-in-out shadow-lg ${splitMode === 'count' ? 'translate-x-full' : ''}`}
                    ></div>
                    
                    <div 
                        className="flex-1 z-10 flex items-center justify-center cursor-pointer gap-2"
                        onClick={() => setSplitMode('length')}
                    >
                        <label htmlFor="split-len-input" className={`text-sm font-semibold transition-colors ${splitMode === 'length' ? 'text-white' : 'text-slate-400'}`}>{t.split_per_chapter}</label>
                        <input 
                            id="split-len-input"
                            type="number" 
                            value={splitLength} 
                            onChange={(e) => setSplitLength(e.target.value)} 
                            onClick={(e) => { e.stopPropagation(); setSplitMode('length'); }}
                            className="w-16 bg-transparent border-b border-slate-600 focus:border-cyan-400 rounded-none px-2 py-0.5 text-sm text-center text-white focus:outline-none focus:ring-0" 
                        />
                        <span className={`text-xs transition-colors ${splitMode === 'length' ? 'text-slate-200' : 'text-slate-500'}`}>{t.split_chars}</span>
                    </div>

                    <div 
                        className="flex-1 z-10 flex items-center justify-center cursor-pointer gap-2"
                        onClick={() => setSplitMode('count')}
                    >
                        <label htmlFor="split-cnt-input" className={`text-sm font-semibold transition-colors ${splitMode === 'count' ? 'text-white' : 'text-slate-400'}`}>{t.split_into}</label>
                        <input 
                            id="split-cnt-input"
                            type="number" 
                            value={splitCount} 
                            onChange={(e) => setSplitCount(e.target.value)} 
                            onClick={(e) => { e.stopPropagation(); setSplitMode('count'); }}
                            className="w-12 bg-transparent border-b border-slate-600 focus:border-cyan-400 rounded-none px-2 py-0.5 text-sm text-center text-white focus:outline-none focus:ring-0" 
                        />
                        <span className={`text-xs transition-colors ${splitMode === 'count' ? 'text-slate-200' : 'text-slate-500'}`}>{t.split_chapters}</span>
                    </div>
                </div>
                
                <div className="flex-shrink-0">
                    <button type="button" onClick={handleSplitNow} className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-900 text-sm font-bold rounded-lg transition-colors shadow-sm active:scale-95">
                        {t.split_now}
                    </button>
                </div>
            </div>
        </div>

        <div className="space-y-0 h-full flex flex-col">
          <div className="flex justify-between items-center mb-2 px-1">
            <label className="block text-[17px] font-bold text-yellow-400">{t.script_label}</label>
            <div className="flex items-center space-x-2">
                <button type="button" onClick={handleDeleteChapter} disabled={storyChapters.length <= 1} className="p-2 text-red-400/80 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all disabled:opacity-30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
                <button type="button" onClick={handleAddChapter} disabled={isLoading || storyChapters.length >= 12} className="p-1.5 bg-yellow-500 text-slate-900 rounded-full hover:bg-yellow-600 disabled:bg-slate-500 disabled:cursor-not-allowed transition-all shadow-md active:scale-90">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                </button>
            </div>
          </div>
          
          <div className="bg-slate-800/40 border border-slate-700 rounded-lg h-[420px] flex flex-col overflow-hidden relative group">
            <CopyButton text={activeChapter?.text || ''} />
            {/* Tab bar */}
            <div className="flex bg-slate-900/50 border-b border-slate-700 overflow-x-auto no-scrollbar">
                {storyChapters.map((chapter, index) => (
                    <button
                        key={chapter.id}
                        type="button"
                        onClick={() => setActiveChapterId(chapter.id)}
                        className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${activeChapterId === chapter.id ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                    >
                        {t.chapter_label} {index + 1}
                    </button>
                ))}
            </div>
            
            <div className="flex-1 relative p-4 group">
                 <textarea 
                    value={activeChapter?.text || ''} 
                    onChange={(e) => handleChapterTextChange(activeChapter?.id || '', e.target.value)}
                    placeholder={`${t.chapter_placeholder}...`}
                    className="w-full h-full bg-transparent border-none focus:ring-0 text-slate-200 resize-none p-0 text-sm leading-relaxed" 
                    disabled={isLoading}
                />
                <div className="absolute bottom-4 right-4 text-[11px] text-slate-500 font-medium">
                    {(activeChapter?.text || '').length} {t.char_count}
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-700">
        <div>
           <div className="flex justify-between items-center mb-3">
             <h3 className="text-lg font-semibold text-green-400">{t.char_def_label}</h3>
             <button
                type="button"
                onClick={onGenerateCharacterDefinition}
                disabled={isLoading || isChatLoading || !ideaInput.trim()}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-bold rounded-md text-slate-900 bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-500 disabled:cursor-not-allowed"
              >
                {t.char_def_auto}
              </button>
           </div>
           <div className="relative">
              <textarea 
                rows={15} 
                value={characterDefinition} 
                onChange={(e) => setCharacterDefinition(e.target.value)}
                placeholder={t.char_def_placeholder}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-green-500 transition-colors"
                disabled={isLoading || isChatLoading}
              />
              {isChatLoading && (
                <div className="absolute inset-0 bg-slate-800/60 backdrop-blur-sm flex items-center justify-center rounded-lg">
                    <svg className="animate-spin h-10 w-10 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                       <path d="M18 2H6v6l4 4-4 4v6h12v-6l-4-4 4-4V2zM8 20v-4l4-4 4 4v4H8zm8-12H8V4h8v4z"/>
                    </svg>
                </div>
              )}
           </div>
        </div>
      </div>
       
      <div className="flex flex-wrap items-center justify-between gap-4 pt-6 mt-6 border-t border-slate-700">
        <div className="flex items-center gap-x-4 gap-y-3">
            <label className="block text-sm font-medium text-slate-300">{t.output_label}</label>
            <div className="flex flex-wrap items-center gap-3">
            {[
                    {id: 'image' as const, label: t.output_image, value: generateImage},
                    {id: 'motion' as const, label: t.output_motion, value: generateMotion},
                    {id: 'whisk' as const, label: t.output_whisk, value: generateWhisk},
                    {id: 'dreamina' as const, label: t.output_dreamina, value: generateDreamina},
                ].map(opt => {
                    const isActivating = !opt.value;
                    const activeCount = [generateImage, generateMotion, generateWhisk, generateDreamina].filter(Boolean).length;
                    
                    let isDisabled = false;
                    if (isActivating && activeCount >= 3) {
                        if (!((opt.id === 'whisk' && generateDreamina) || (opt.id === 'dreamina' && generateWhisk))) {
                            isDisabled = true;
                        }
                    }

                    return (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleToggleOption(opt.id)}
                            disabled={isDisabled}
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900
                                ${opt.value ? 'bg-cyan-500 text-white ring-cyan-400' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}
                                ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            {opt.label}
                        </button>
                    );
                })}
            </div>
        </div>
        
        <div className="flex items-center space-x-4">
            <button
                type="button"
                onClick={onClearPrompts}
                disabled={!script || script.scenes.length === 0 || isLoading}
                className="px-4 py-2 text-sm font-semibold rounded-md text-slate-300 bg-red-800 hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            >
                {t.clear_prompts_btn}
            </button>
            <button 
                type="button" 
                onClick={handleMainButtonClick} 
                disabled={isGenerationStartDisabled && (generationStatus === 'idle' || generationStatus === 'done')}
                className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-slate-900 bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-yellow-400 disabled:bg-slate-500 disabled:text-slate-300 transition-all">
                {generationStatus === 'generating' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="shaking-hourglass -ml-1 mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 2h14"></path>
                    <path d="M5 22h14"></path>
                    <path d="M7 2v5.5A2.5 2.5 0 0 0 9.5 10h5A2.5 2.5 0 0 0 17 7.5V2"></path>
                    <path d="M7 22v-5.5A2.5 2.5 0 0 1 9.5 14h5a2.5 2.5 0 0 1 2.5 2.5V22"></path>
                  </svg>
                )}
                {getButtonText()}
            </button>
        </div>
      </div>
      
      <div className={`mt-4 flex flex-wrap items-center gap-x-8 gap-y-3 transition-opacity ${!generateMotion ? 'opacity-50' : ''}`}>
        <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-300">{t.music_desc}</span>
            <label htmlFor="music-toggle" className={`flex items-center ${!generateMotion ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <div className="relative">
                    <input type="checkbox" id="music-toggle" className="sr-only" checked={includeMusic} onChange={e => setIncludeMusic(e.target.checked)} disabled={!generateMotion}/>
                    <div className={`block w-14 h-8 rounded-full transition-colors ${includeMusic && generateMotion ? 'bg-green-500 ring-2 ring-green-400 ring-offset-2 ring-offset-slate-800' : 'bg-slate-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${includeMusic && generateMotion ? 'transform translate-x-6' : ''}`}></div>
                </div>
            </label>
        </div>
        <div className="flex items-center gap-3">
            <label htmlFor="dialogue-language" className="text-sm font-medium text-slate-300">{t.dialogue_lang_label}</label>
            <input
            id="dialogue-language"
            type="text"
            value={dialogueLanguage}
            onChange={(e) => setDialogueLanguage(e.target.value)}
            placeholder={t.dialogue_lang_placeholder}
            className="w-48 bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={!generateMotion}
            />
        </div>
      </div>
    </form>
  );
};

export default InputForm;
