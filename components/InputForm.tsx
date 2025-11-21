import React, { useState, useEffect, useRef } from 'react';
import type { StyleInfo, CharacterReference, StoryChapter } from '../types';
import { analyzeCharacterImage } from '../services/geminiService';


interface InputFormProps {
  // State props
  apiKey: string;
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
  isLoading: boolean;
  isSplitting: boolean;
  isGeneratingDef: boolean;
  styles: StyleInfo[];
  aspectRatios: {name: string, value: string}[];
  storyChapters: StoryChapter[];
  splitMode: 'range' | 'number';
  numberOfChapters: string;
  
  characterSource: 'definition' | 'references';
  setCharacterSource: (source: 'definition' | 'references') => void;

  // Handler props
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
  setStyles: (styles: StyleInfo[]) => void;
  setAspectRatios: (ratios: {name: string, value: string}[]) => void;
  setStoryChapters: (chapters: StoryChapter[] | ((prev: StoryChapter[]) => StoryChapter[])) => void;
  setSplitMode: (mode: 'range' | 'number') => void;
  setNumberOfChapters: (num: string) => void;

  // Action props
  onSubmit: () => void;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSplitStory: () => void;
  onGenerateCharacterDefinition: () => void;
}


// (fileToBase64 và các hằng số defaultStyles, defaultAspectRatios giữ nguyên)
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
    { name: 'Photorealistic', prompt: 'photorealistic, highly detailed realistic photo, natural lighting, soft shadows, 8K resolution, ultra-detailed, sharp focus, professional DSLR photo, high dynamic range (HDR)', definition: 'Tạo ra hình ảnh giống hệt như ảnh chụp thực tế từ máy ảnh chuyên nghiệp, tập trung vào tính chân thực, chi tiết cao và tuân thủ các quy luật vật lý (ánh sáng, bóng đổ, tỷ lệ).' },
    { name: 'Anime', prompt: 'anime style, vibrant colors, cel-shaded, Studio Ghibli inspired, detailed background art', definition: 'Phong cách nghệ thuật hoạt hình Nhật Bản, với đặc trưng phóng đại, màu sắc rực rỡ và biểu cảm cảm xúc mạnh mẽ. Ưu tiên tính nghệ thuật hơn tính chân thực.' },
    { name: '2 anh em mèo', prompt: '3D animation style, Disney Pixar style, cinematic, hyper-realistic, photorealistic, high detail, Cute anthropomorphic kitten, adorable cat, big expressive eyes, Soft lighting, warm golden hour lighting, vibrant colors', definition: 'Phong cách hoạt hình 3D dễ thương, đáng yêu lấy cảm hứng từ Disney Pixar, với ánh sáng ấm áp và màu sắc rực rỡ, tập trung vào các nhân vật mèo nhân hóa.' },
    { name: 'Cyberpunk', prompt: 'cyberpunk aesthetic, neon lights, futuristic cityscape, dystopian, Blade Runner style, rain-slicked streets', definition: 'Bối cảnh tương lai gần với công nghệ cao nhưng xã hội thấp kém (high-tech, low-life), đặc trưng bởi sự hỗn loạn, ánh đèn neon và sự hòa quyện giữa con người và máy móc.' },
    { name: 'Fantasy', prompt: 'epic fantasy, magical, ethereal lighting, high fantasy art, Lord of the Rings inspired, mystical atmosphere', definition: 'Lấy cảm hứng từ thế giới tưởng tượng, bao gồm các yếu tố huyền bí, phép thuật, sinh vật huyền thoại và bối cảnh siêu nhiên, tạo cảm giác kỳ diệu và phiêu lưu.' },
    { name: 'Vintage', prompt: 'vintage film look, grainy texture, retro color palette, 1970s style, Kodachrome aesthetic, lens flares', definition: 'Lấy cảm hứng từ các thời kỳ quá khứ (thường là 20-100 năm trước), nhấn mạnh vào sự hoài cổ, màu sắc phai nhạt và các yếu tố đại diện cho một kỷ nguyên cụ thể.' },
];

export const defaultAspectRatios = [
    { name: 'Ngang', value: '16:9' },
    { name: 'Dọc', value: '9:16' },
    { name: 'Vuông', value: '1:1' },
    { name: 'Cổ điển', value: '4:3' },
];

const InfoTooltip: React.FC<{ text: string }> = ({ text }) => (
    <div className="relative group flex items-center ml-1.5 cursor-help">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 group-hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="absolute bottom-full mb-2 w-64 p-3 bg-slate-700 text-slate-200 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 left-1/2 -translate-x-1/2 invisible group-hover:visible">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-700"></div>
        </div>
    </div>
);

const InputForm: React.FC<InputFormProps> = (props) => {
  const {
      apiKey,
      mode, ideaInput, longStoryInput, chapterSplitRange, selectedStylePrompts, characterReferences, characterDefinition, aspectRatio,
      generateImage, generateMotion, includeMusic, dialogueLanguage,
      isLoading, isGeneratingDef, styles, aspectRatios, storyChapters,
      splitMode, numberOfChapters,
      characterSource, 
      setMode, setIdeaInput, setLongStoryInput, setChapterSplitRange, setSelectedStylePrompts, setCharacterReferences, setCharacterDefinition,
      setAspectRatio, setGenerateImage, setGenerateMotion, setIncludeMusic,
      setDialogueLanguage, setStyles, setAspectRatios,
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

  const [focusedChapterId, setFocusedChapterId] = useState<string | null>(null);
  
  const [draggedCharId, setDraggedCharId] = useState<string | null>(null);
  
  const importFileRef = useRef<HTMLInputElement>(null);

  // (Các hàm handler từ handleStyleClick đến handleChapterTextChange giữ nguyên)
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
            alert("Bạn chỉ có thể chọn tối đa 3 phong cách.");
        }
    }
    setSelectedStylePrompts(newSelection);
  };
  const handleSaveStyle = () => {
    if (!newStyleName.trim() || !newStylePrompt.trim()) return;
    const newStyle: StyleInfo = { name: newStyleName.trim(), prompt: newStylePrompt.trim(), definition: 'Phong cách tùy chỉnh do người dùng thêm vào.' };
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
  const handleAddCharacter = () => {
    if (characterReferences.length < 5) {
      const newChar: CharacterReference = {
        id: `char-${Date.now()}`,
        name: `Nhân vật ${characterReferences.length + 1}`,
        imageBase64: null,
        fileType: null,
        description: '',
        isAnalyzing: false,
      };
      setCharacterReferences([...characterReferences, newChar]);
    }
  };
  const handleCharacterUpdate = (id: string, field: keyof CharacterReference, value: any) => {
    setCharacterReferences(prev =>
      prev.map(char => (char.id === id ? { ...char, [field]: value } : char))
    );
  };
  const handleImageUpload = async (id: string, file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        alert("Chỉ chấp nhận tệp hình ảnh (JPEG, PNG, WEBP...).");
        return;
    }
    try {
      const { base64, type } = await fileToBase64(file);
      setCharacterReferences(prev =>
        prev.map(char => (char.id === id ? { ...char, imageBase64: base64, fileType: type } : char))
      );
    } catch (error) {
      console.error("Error converting file to base64:", error);
    }
  };
  const handleAnalyze = async (id: string) => {
    const character = characterReferences.find(c => c.id === id);
    if (!character || !character.imageBase64 || !character.fileType) {
      alert("Vui lòng tải lên hình ảnh nhân vật trước khi phân tích.");
      return;
    }

    handleCharacterUpdate(id, 'isAnalyzing', true);
    try {
      const description = await analyzeCharacterImage(character.imageBase64, character.fileType, apiKey);
      handleCharacterUpdate(id, 'description', description);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
      alert(errorMessage);
    } finally {
      handleCharacterUpdate(id, 'isAnalyzing', false);
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((ideaInput.trim() || storyChapters.some(c => c.text.trim())) && !isLoading) {
      onSubmit();
    }
  };
  const handleAddChapter = () => {
    setStoryChapters(prev => [
      ...prev,
      { id: `chapter-${Date.now()}`, text: '' }
    ]);
  };
  const handleChapterTextChange = (id: string, text: string) => {
    setStoryChapters(prev => prev.map(ch => ch.id === id ? { ...ch, text } : ch));
  };
  
  // Logic Disable nút
  const isSubmitDisabled = isLoading || (ideaInput.trim() === '' && !storyChapters.some(c => c.text.trim())) || (!generateImage && !generateMotion);

  // Logic hiển thị Text nút bấm (Hack nhẹ: vì InputForm không biết completedCount, 
  // nhưng chúng ta có thể đoán dựa trên props hoặc đơn giản là để ScriptGenerator quản lý nút này
  // Tuy nhiên để nhanh, ta giữ nguyên cấu trúc, chỉ thay đổi text mặc định)
  
  // **LƯU Ý**: Để hiển thị chính xác "3/12", chúng ta cần truyền `completedCount` từ cha xuống.
  // Nhưng vì bạn yêu cầu "chỉ sửa logic", tôi sẽ làm nút bấm luôn hiển thị "Tạo Kịch bản & Prompts (3 cảnh tiếp theo)"
  // Trừ khi bạn muốn tôi sửa cả interface InputFormProps thêm 1 lần nữa để nhận `completedCount`.
  // Dưới đây tôi sẽ để text chung, nhưng ScriptGenerator sẽ lo logic dừng lại khi hết.

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       
       {/* ... (Phần Phong cách & Tỉ lệ khung hình giữ nguyên) ... */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <div>
          <label className="text-[20px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-3 block">Phong cách (Chọn tối đa 3)</label>
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
              {isAddingStyle ? 'Đóng' : 'Thêm mới +'}
            </button>
          </div>
          {isAddingStyle && (
              <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-3">
                  <input type="text" value={newStyleName} onChange={(e) => setNewStyleName(e.target.value)} placeholder="Tên phong cách (ví dụ: Ghibli tối màu)" className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500" />
                  <textarea rows={2} value={newStylePrompt} onChange={(e) => setNewStylePrompt(e.target.value)} placeholder="Prompt phong cách (ví dụ: dark fantasy, moody, Studio Ghibli inspired, painterly)" className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500" />
                  <button type="button" onClick={handleSaveStyle} className="px-4 py-2 text-sm font-medium rounded-md bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500">Lưu phong cách</button>
              </div>
          )}
        </div>
        
        <div>
          <label className="text-[20px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-3 block">Tỉ lệ khung hình</label>
           <div className="flex flex-wrap gap-3 items-center">
            {aspectRatios.map((ratio) => (
              <button key={ratio.value} type="button" onClick={() => setAspectRatio(ratio.value)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 ${ aspectRatio === ratio.value ? 'bg-purple-500 text-slate-900 ring-2 ring-purple-300' : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/40' }`}
              >{ratio.name} ({ratio.value})</button>
            ))}
            <button type="button" onClick={() => setIsAddingAspectRatio(!isAddingAspectRatio)} className="px-3 py-2 text-sm font-semibold rounded-full bg-slate-700 hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500">
              {isAddingAspectRatio ? 'Đóng' : 'Nhập +'}
            </button>
          </div>
          {isAddingAspectRatio && (
              <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-3">
                  <input type="text" value={newAspectRatioName} onChange={(e) => setNewAspectRatioName(e.target.value)} placeholder="Tên tỉ lệ (ví dụ: Màn ảnh rộng)" className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:ring-1 focus:ring-purple-500" />
                  <input type="text" value={newAspectRatioValue} onChange={(e) => setNewAspectRatioValue(e.target.value)} placeholder="Giá trị tỉ lệ (ví dụ: 21:9)" className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:ring-1 focus:ring-purple-500" />
                  <button type="button" onClick={handleSaveAspectRatio} className="px-4 py-2 text-sm font-medium rounded-md bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-purple-500">Lưu tỉ lệ</button>
              </div>
          )}
        </div>
      </div>
       
      {/* ... (Phần Quản lý Dự án giữ nguyên) ... */}
      <div className="mt-6">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Quản lý Dự án & Tùy chọn Kịch bản</h3>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <button
                        type="button"
                        onClick={onExport}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Xuất Dự án ra File (.json)
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
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Nạp Dự án từ File
                    </button>
                </div>
            </div>
        </div>

      {/* ... (Phần Nhập/Chia kịch bản giữ nguyên) ... */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-6 pt-6 border-t border-slate-700">
        <div>
          <label htmlFor="long-story-input" className="block text-[17px] font-bold text-yellow-400 mb-2">Nhập câu chuyện</label>
          <textarea
              id="long-story-input"
              rows={15}
              value={longStoryInput}
              onChange={(e) => setLongStoryInput(e.target.value)}
              placeholder="Dán toàn bộ câu chuyện của bạn vào đây..."
              className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-sm text-slate-200 focus:ring-2 focus:ring-yellow-500"
              disabled={isLoading}
          />
          <div className="mt-4 p-4 border border-slate-700 rounded-lg bg-slate-800/50">
            <div className="space-y-3">
                <div className="flex items-center">
                    <input
                        type="radio"
                        id="split-by-range"
                        name="split-mode"
                        value="range"
                        checked={splitMode === 'range'}
                        onChange={() => setSplitMode('range')}
                        className="h-4 w-4 text-yellow-500 bg-slate-700 border-slate-600 focus:ring-yellow-600"
                    />
                    <label htmlFor="split-by-range" className="ml-3 flex items-center text-sm font-medium text-slate-300 whitespace-nowrap">
                        Chia mỗi chương khoảng:
                        <InfoTooltip text="Chia câu chuyện thành các chương có số ký tự dao động quanh giá trị đã nhập, với chênh lệch tối đa 200 ký tự. Mỗi chương sẽ kết thúc tại một điểm ngắt câu (dấu chấm)." />
                        <input
                            id="split-range-input"
                            type="number"
                            value={chapterSplitRange}
                            onChange={(e) => setChapterSplitRange(e.target.value)}
                            placeholder="VD: 1000"
                            className="ml-2 w-28 bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:ring-1 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading || splitMode !== 'range'}
                        />
                        <span className="ml-2 text-slate-400">ký tự</span>
                    </label>
                </div>
                <div className="flex items-center">
                    <input
                        type="radio"
                        id="split-by-number"
                        name="split-mode"
                        value="number"
                        checked={splitMode === 'number'}
                        onChange={() => setSplitMode('number')}
                        className="h-4 w-4 text-yellow-500 bg-slate-700 border-slate-600 focus:ring-yellow-600"
                    />
                    <label htmlFor="split-by-number" className="ml-3 flex items-center text-sm font-medium text-slate-300 whitespace-nowrap">
                        Chia thành số chương:
                        <InfoTooltip text="Chia câu chuyện thành số chương đã chỉ định, giữ cho độ dài của chúng cân bằng nhất có thể. Mỗi chương sẽ kết thúc tại một điểm ngắt câu." />
                         <input
                            id="split-number-input"
                            type="number"
                            value={numberOfChapters}
                            onChange={(e) => setNumberOfChapters(e.target.value)}
                            placeholder="VD: 5"
                            className="ml-2 w-28 bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:ring-1 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading || splitMode !== 'number'}
                            min="1"
                        />
                    </label>
                </div>
            </div>
            <div className="flex justify-end mt-4">
                 <button
                    type="button"
                    onClick={onSplitStory}
                    disabled={isLoading || !longStoryInput.trim()}
                    className="ml-auto inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-slate-900 bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-yellow-500 disabled:bg-slate-500 disabled:cursor-not-allowed"
                >
                    Chia thành các chương
                </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <label className="block text-[17px] font-bold text-yellow-400 mb-2">Đã chia cảnh</label>
            <div className="flex items-center space-x-2 flex-shrink-0">
                <button type="button" onClick={handleAddChapter} disabled={isLoading} className="p-2 bg-yellow-500 text-slate-900 rounded-full hover:bg-yellow-600 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                </button>
            </div>
          </div>
          
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
          {storyChapters.map((chapter, index) => (
            <div key={chapter.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-slate-300">Chương {index + 1}</label>
                    {index > 0 && (
                        <button type="button" onClick={() => setStoryChapters(prev => prev.filter(c => c.id !== chapter.id))} className="p-1 text-slate-400 hover:text-red-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}
                </div>
                <textarea 
                    rows={focusedChapterId === chapter.id ? 10 : 3} 
                    value={chapter.text} 
                    onChange={(e) => handleChapterTextChange(chapter.id, e.target.value)}
                    onFocus={() => setFocusedChapterId(chapter.id)}
                    onBlur={() => setFocusedChapterId(null)}
                    placeholder={`Nội dung cho chương ${index + 1}...`}
                    className="w-full bg-slate-800 border border-slate-600 rounded-md p-3 text-slate-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300" 
                    disabled={isLoading}
                />
                <div className="text-right text-xs text-slate-400 mt-1 pr-1">
                  {chapter.text.length} ký tự
                </div>
            </div>
            ))}
             {storyChapters.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-slate-700 rounded-lg">
                    <p className="text-slate-500">Các chương sẽ xuất hiện ở đây sau khi bạn chia câu chuyện.</p>
                </div>
            )}
          </div>

        </div>
      </div>

      
      {/* ... (Phần Định nghĩa nhân vật & Tham chiếu nhân vật giữ nguyên) ... */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
           <div className="flex justify-between items-center mb-3">
             
             {/* Sửa Label thành Checkbox */}
             <label htmlFor="char-source-definition" className="flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  id="char-source-definition" 
                  name="characterSource"
                  checked={characterSource === 'definition'}
                  onChange={() => setCharacterSource('definition')}
                  className="h-4 w-4 text-green-500 bg-slate-700 border-slate-600 focus:ring-green-600"
                />
                <h3 className="ml-2 text-lg font-semibold text-green-400">Định nghĩa nhân vật</h3>
             </label>
             {/* Kết thúc sửa Label */}

             <button
                type="button"
                onClick={onGenerateCharacterDefinition}
                disabled={isLoading || isGeneratingDef || !storyChapters.some(c => c.text.trim())}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-bold rounded-md text-slate-900 bg-yellow-500 hover:bg-yellow-600 disabled:bg-slate-500 disabled:cursor-not-allowed"
              >
                 {isGeneratingDef ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                 )}
                Tạo định nghĩa nhân vật
              </button>
           </div>
          <textarea 
            rows={15} 
            value={characterDefinition} 
            onChange={(e) => setCharacterDefinition(e.target.value)}
            placeholder="Dùng nút 'Tạo định nghĩa' ở trên, hoặc tự viết định nghĩa nhân vật (bằng Tiếng Việt) vào đây..."
            className={`w-full h-full bg-slate-800/50 border rounded-lg p-3 text-sm text-slate-200 placeholder-slate-400 focus:ring-2  focus:border-green-500 transition-colors ${characterSource === 'definition' ? 'border-green-500 ring-1 ring-green-500' : 'border-slate-700'}`}
            disabled={isLoading || characterSource !== 'definition'}
          />
        </div>

        <div>
            {/* Sửa Label thành Checkbox */}
            <label htmlFor="char-source-references" className="flex items-center cursor-pointer mb-3">
              <input 
                type="radio" 
                id="char-source-references" 
                name="characterSource"
                checked={characterSource === 'references'}
                onChange={() => setCharacterSource('references')}
                className="h-4 w-4 text-green-500 bg-slate-700 border-slate-600 focus:ring-green-600"
              />
              <h3 className="ml-2 text-lg font-semibold text-green-400">Tham Chiếu Nhân Vật (Tùy chọn)</h3>
            </label>
            {/* Kết thúc sửa Label */}

            <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4 rounded-lg border transition-colors ${characterSource === 'references' ? 'border-green-500 ring-1 ring-green-500' : 'border-slate-700 border-dashed'}`}>
              {characterReferences.map((char) => (
                <div key={char.id} className={`bg-slate-800/50 p-4 border border-slate-700 rounded-lg space-y-3 ${isLoading || characterSource !== 'references' ? 'opacity-50' : ''}`}>
                  <input type="text" value={char.name} onChange={(e) => handleCharacterUpdate(char.id, 'name', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm font-semibold text-slate-200 focus:ring-1 focus:ring-green-500"
                    disabled={isLoading || characterSource !== 'references'}
                  />
                  
                  <div 
                    className={`relative w-full h-40 bg-slate-700 rounded-md flex items-center justify-center border-2 border-dashed transition-colors ${draggedCharId === char.id ? 'border-cyan-500 bg-slate-600' : 'border-slate-600'} ${characterSource !== 'references' ? 'cursor-not-allowed' : ''}`}
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (characterSource === 'references') setDraggedCharId(char.id);
                    }}
                    onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDraggedCharId(null);
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDraggedCharId(null);
                        if (characterSource === 'references') {
                          const file = e.dataTransfer.files?.[0];
                          if (file) {
                              handleImageUpload(char.id, file);
                          }
                        }
                    }}
                  >
                    {draggedCharId === char.id && (
                        <div className="absolute inset-0 bg-cyan-500/30 flex items-center justify-center pointer-events-none z-10">
                            <p className="text-cyan-200 font-semibold">Thả ảnh vào đây</p>
                        </div>
                    )}

                    {char.imageBase64 ? (
                      <>
                        <img src={`data:${char.fileType};base64,${char.imageBase64}`} alt={`Preview ${char.name}`} className="object-contain h-full w-full rounded-md"/>
                        <button type="button" onClick={() => handleCharacterUpdate(char.id, 'imageBase64', null)}
                          className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-500 text-white rounded-full p-1 leading-none focus:outline-none z-20"
                          disabled={isLoading || characterSource !== 'references'}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </>
                    ) : (
                      <label className={`${characterSource === 'references' ? 'cursor-pointer' : 'cursor-not-allowed'} text-center text-slate-400 p-4`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="text-xs mt-1 block">Tải lên hoặc Kéo thả</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleImageUpload(char.id, e.target.files ? e.target.files[0] : null)}
                          disabled={isLoading || characterSource !== 'references'}
                        />
                      </label>
                    )}
                  </div>
                  
                  <button type="button" onClick={() => handleAnalyze(char.id)} disabled={!char.imageBase64 || char.isAnalyzing || isLoading || characterSource !== 'references'}
                    className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:bg-slate-500 disabled:cursor-not-allowed">
                    {char.isAnalyzing ? <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : null}
                    Phân tích bằng AI
                  </button>

                  <textarea rows={4} value={char.description} onChange={(e) => handleCharacterUpdate(char.id, 'description', e.target.value)}
                    placeholder="AI sẽ điền mô tả Tiếng Việt vào đây..."
                    className="w-full bg-yellow-500/10 border border-yellow-500/30 rounded-md p-2 text-sm text-yellow-200 placeholder-yellow-400/50 focus:ring-1 focus:ring-yellow-400"
                    disabled={isLoading || characterSource !== 'references'}
                  />
                </div>
              ))}
              {characterReferences.length < 5 && (
                 <button 
                    type="button" 
                    onClick={handleAddCharacter} 
                    className="w-full h-full bg-slate-800/50 border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:bg-slate-700/50 hover:border-slate-500 transition-colors min-h-[150px] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || characterSource !== 'references'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    <span className="mt-2 text-sm font-medium">Thêm nhân vật</span>
                 </button>
              )}
            </div>
        </div>
      </div>
       
      {/* ... (Phần Tùy chỉnh chi tiết & Nút Submit giữ nguyên) ... */}
      <div className="mt-6 pt-2 p-4 bg-slate-800/50 border border-slate-700 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-200">Tùy chỉnh chi tiết</h3>

            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                  <input type="checkbox" id="image-prompt-toggle" checked={generateImage} onChange={(e) => setGenerateImage(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-cyan-400 focus:ring-cyan-500" />
                  <label htmlFor="image-prompt-toggle" className="ml-3 block text-sm font-medium text-slate-200">Prompt Tạo Ảnh</label>
              </div>
              <div className="flex items-center">
                  <input type="checkbox" id="motion-prompt-toggle" checked={generateMotion} onChange={(e) => setGenerateMotion(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-cyan-400 focus:ring-cyan-500" />
                  <label htmlFor="motion-prompt-toggle" className="ml-3 block text-sm font-medium text-slate-200">Prompt Tạo Chuyển Động</label>
              </div>
            </div>

            <button type="submit" disabled={isSubmitDisabled}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-all">
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  {/* HIỂN THỊ TRẠNG THÁI BATCH */}
                  {storyChapters.length > 0 && !isSubmitDisabled ? (
                      `Tạo Kịch bản (Batch)`
                  ) : (
                      `Tạo Kịch bản & Prompts`
                  )}
                </>
              ) : (
                /* HIỂN THỊ TRẠNG THÁI CHỜ */
                `Tạo Kịch bản & Prompts (Batch 3)`
              )}
            </button>
          </div>
          <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-300">Bao gồm mô tả âm nhạc (Music) trong prompt.</span>
              <label htmlFor="music-toggle" className="flex items-center cursor-pointer">
                  <div className="relative">
                      <input type="checkbox" id="music-toggle" className="sr-only" checked={includeMusic} onChange={e => setIncludeMusic(e.target.checked)}/>
                      <div className={`block w-14 h-8 rounded-full transition-colors ${includeMusic ? 'bg-green-500 ring-2 ring-green-400 ring-offset-2 ring-offset-slate-800' : 'bg-slate-600'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${includeMusic ? 'transform translate-x-6' : ''}`}></div>
                  </div>
              </label>
          </div>
          <div className="flex items-center justify-between">
              <label htmlFor="dialogue-language" className="flex items-center text-sm font-medium text-slate-300">
                Ngôn ngữ đối thoại
                <InfoTooltip text="Nhập tên ngôn ngữ bất kỳ mà Gemini hỗ trợ (ví dụ: English, Spanish, Korean, Tiếng Pháp...)" />
              </label>
              <input 
                type="text"
                id="dialogue-language" 
                value={dialogueLanguage} 
                onChange={(e) => setDialogueLanguage(e.target.value)}
                placeholder="Ví dụ: English, Spanish, Korean..."
                className="w-48 bg-slate-700 border border-slate-600 rounded-md p-2 text-sm text-slate-200 focus:ring-1 focus:ring-cyan-500 placeholder-slate-400" 
              />
          </div>
      </div>
    </form>
  );
};

export default InputForm;