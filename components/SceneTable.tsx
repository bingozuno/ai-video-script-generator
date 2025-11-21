import React, { useState } from 'react';
import type { Scene } from '../types';
import CodeBlock from './CodeBlock';

interface SceneTableProps {
  scenes: Scene[];
  totalScenes: number;
  onGenerateImage: (sceneIndex: number) => void;
  onRegeneratePrompt: (sceneIndex: number) => void;
  onOpenImage: (src: string, name: string) => void;
}

const ImageGenerationPlaceholder: React.FC<{ isGenerating: boolean }> = ({ isGenerating }) => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-700 min-h-[250px]">
    {isGenerating ? (
      <div className="flex flex-col items-center text-cyan-400 animate-pulse">
        <svg className="animate-spin h-10 w-10 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-sm font-semibold">Đang vẽ tranh...</span>
      </div>
    ) : (
      <div className="text-center text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm">Ảnh sẽ xuất hiện ở đây</p>
      </div>
    )}
  </div>
);

const SceneTable: React.FC<SceneTableProps> = ({ scenes, totalScenes, onGenerateImage, onRegeneratePrompt, onOpenImage }) => {
  // State để theo dõi Tab nào đang mở (mặc định là cảnh đầu tiên: 0)
  const [activeTab, setActiveTab] = useState(0);

  if (!scenes || scenes.length === 0) return null;

  // Lấy dữ liệu của cảnh đang chọn
  const activeScene = scenes[activeTab];

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
      
      {/* 1. THANH TAB (Scroll ngang) */}
      <div className="flex overflow-x-auto bg-slate-900/80 border-b border-slate-700 scrollbar-hide">
        {scenes.map((scene, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`
                flex-shrink-0 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all duration-200 border-r border-slate-700/50
                ${activeTab === index 
                    ? 'bg-slate-800 text-cyan-400 border-t-4 border-t-cyan-400 shadow-[inset_0_-4px_4px_rgba(0,0,0,0.2)]' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}
            `}
          >
            {scene.sceneNumber}
          </button>
        ))}
      </div>

      {/* 2. NỘI DUNG TAB */}
      <div className="p-6 space-y-8 min-h-[500px]">
        
        {/* Phần A: Mô tả Kịch bản */}
        <div className="bg-slate-700/30 rounded-lg p-5 border border-slate-600/50">
            <h3 className="text-yellow-400 font-bold text-sm uppercase mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                Nội dung Kịch bản ({activeScene.sceneNumber})
            </h3>
            <p className="text-slate-200 text-base leading-relaxed whitespace-pre-wrap">
                {activeScene.description}
            </p>
        </div>

        {/* Phần B: Khu vực Hình ảnh (Chia 2 cột: Prompt - Ảnh) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Cột Trái: Prompt & Điều khiển */}
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-end mb-3">
                    <h3 className="text-green-400 font-bold text-sm uppercase flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                        Prompt Tạo Ảnh
                    </h3>
                    <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-700">
                        Đã tạo: <span className="text-green-400 font-bold">{scenes.filter(s => s.generatedImages?.length).length}</span> / {totalScenes}
                    </span>
                </div>
                
                <div className="flex-grow mb-4">
                    <CodeBlock code={activeScene.imagePrompt} />
                </div>

                <div className="flex space-x-3 mt-auto">
                    {/* Nút Tạo Ảnh */}
                    <button 
                        onClick={() => onGenerateImage(activeTab)}
                        disabled={activeScene.isGeneratingImages}
                        className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-bold rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                    >
                        {activeScene.isGeneratingImages ? 'Đang xử lý...' : '✨ Tạo Ảnh'}
                    </button>

                    {/* Nút Tạo Lại Prompt */}
                    <button 
                        onClick={() => onRegeneratePrompt(activeTab)}
                        disabled={activeScene.isRegeneratingPrompt}
                        className="inline-flex items-center justify-center px-4 py-3 border border-slate-600 text-sm font-bold rounded-lg text-green-400 bg-slate-800 hover:bg-slate-700 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                        title="AI viết lại prompt nếu mô tả chưa đúng"
                    >
                         {activeScene.isRegeneratingPrompt ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                         ) : (
                            <div className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                Viết lại Prompt
                            </div>
                         )}
                    </button>
                </div>
            </div>

            {/* Cột Phải: Hiển thị Ảnh */}
            <div className="flex flex-col h-full">
                <h3 className="text-slate-300 font-bold text-sm uppercase mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 3.293A1 1 0 015.586 3H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
                    Kết quả
                </h3>
                
                <div className="flex-grow">
                    {activeScene.generatedImages && activeScene.generatedImages.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 h-full">
                            {activeScene.generatedImages.map((imgSrc, imgIndex) => (
                                <div key={imgIndex} className="relative group rounded-lg overflow-hidden border border-slate-600 shadow-md aspect-video">
                                    <img 
                                        src={imgSrc} 
                                        alt={`Generated ${imgIndex}`} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                                        onClick={() => onOpenImage(imgSrc, `scene-${activeScene.sceneNumber}-img-${imgIndex}.png`)}
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                        <span className="text-white font-semibold text-sm">Phóng to</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <ImageGenerationPlaceholder isGenerating={!!activeScene.isGeneratingImages} />
                    )}
                </div>
            </div>
        </div>

        {/* Phần C: Prompt Chuyển động */}
        <div className="bg-slate-900/30 rounded-lg p-5 border border-purple-500/30">
            <h3 className="text-purple-400 font-bold text-sm uppercase mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>
                Prompt Chuyển động (Veo 3.1)
            </h3>
            <CodeBlock code={activeScene.motionPrompt} />
        </div>

      </div>
    </div>
  );
};

export default SceneTable;