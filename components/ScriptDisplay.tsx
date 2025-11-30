import React, { useState } from 'react';
import type { Script, StoryChapter } from '../types';
import CodeBlock from './CodeBlock';
import SceneTable from './SceneTable';

interface ScriptDisplayProps {
  script: Script | null;
  storyChapters: StoryChapter[];
  isLoading: boolean;
  error: string | null;
  lang?: 'vi' | 'en'; 
  onGenerateImage: (index: number) => void;
  onRegeneratePrompt: (index: number) => void;
  onOpenImage: (src: string, name: string) => void;
}

const ScriptDisplay: React.FC<ScriptDisplayProps> = ({ 
  script, storyChapters, isLoading, error, lang = 'vi',
  onGenerateImage, onRegeneratePrompt, onOpenImage 
}) => {
  
  // TỪ ĐIỂN
  const t = lang === 'vi' ? {
      title: "Bảng Phân Cảnh Chi Tiết",
      downloadTxt: "Tải kịch bản chương",
      downloadPrompt: "Tải Prompt Tạo Ảnh File TXT",
      downloadExcel: "Tải File Excel",
      loading: "Đang tạo kịch bản...",
      empty: "Bảng phân cảnh chi tiết sẽ xuất hiện ở đây.",
      chapter: "Chương"
  } : {
      title: "Detailed Storyboard",
      downloadTxt: "Download Chapter Script",
      downloadPrompt: "Download Image Prompts (TXT)",
      downloadExcel: "Download Excel File",
      loading: "Generating script...",
      empty: "Detailed storyboard will appear here.",
      chapter: "Chapter"
  };

  // --- SỬA LỖI LOGIC TẢI FILE TXT ---
  const handleDownloadTxt = () => {
    // Ưu tiên 1: Nếu đã có kịch bản AI (script), tải kịch bản phân cảnh
    if (script) {
        const content = script.scenes.map(s => `Scene ${s.sceneNumber}:\nDesc: ${s.description}\nImage: ${s.imagePrompt}\nMotion: ${s.motionPrompt}\n`).join('\n---\n');
        downloadFile(content, 'script.txt', 'text/plain');
    } 
    // Ưu tiên 2: Nếu chưa có script nhưng đã chia chương (storyChapters), tải nội dung chương
    else if (storyChapters.length > 0) {
        const content = storyChapters.map((c, i) => `--- ${lang === 'vi' ? 'Chương' : 'Chapter'} ${i + 1} ---\n${c.text}`).join('\n\n');
        downloadFile(content, 'story_chapters.txt', 'text/plain');
    }
  };

  const handleDownloadPromptTxt = () => {
    if (!script) return;
    const content = script.scenes.map(s => s.imagePrompt).join('\n\n');
    downloadFile(content, 'image_prompts.txt', 'text/plain');
  };

  const handleDownloadExcel = () => {
    if (!script) return;
    const csvContent = "data:text/csv;charset=utf-8," 
        + "Scene,Description,Image Prompt,Motion Prompt\n"
        + script.scenes.map(s => `"${s.sceneNumber}","${s.description.replace(/"/g, '""')}","${s.imagePrompt.replace(/"/g, '""')}","${s.motionPrompt.replace(/"/g, '""')}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "script.csv");
    document.body.appendChild(link);
    link.click();
  };

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  };

  if (isLoading && !script) {
    return (
      <div className="mt-8 p-12 text-center border border-slate-700 rounded-lg bg-slate-800/50 animate-pulse">
        <p className="text-cyan-400 text-lg font-medium">{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-6 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200">
        <h3 className="font-bold mb-2">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="flex justify-between items-center border-b border-slate-700 pb-4">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          {t.title}
        </h2>
        <div className="flex space-x-2">
            {/* SỬA LỖI DISABLED: Nút này sẽ SÁNG nếu có Script HOẶC có StoryChapters */}
            <button 
                onClick={handleDownloadTxt} 
                disabled={!script && storyChapters.length === 0} 
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors disabled:opacity-50 font-medium"
            >
               ⬇ {t.downloadTxt}
            </button>

            {/* Hai nút này vẫn cần Script của AI mới chạy được nên giữ nguyên điều kiện */}
            <button onClick={handleDownloadPromptTxt} disabled={!script} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded transition-colors disabled:opacity-50 font-medium">
               ⬇ {t.downloadPrompt}
            </button>
            <button onClick={handleDownloadExcel} disabled={!script} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors disabled:opacity-50 font-medium">
               ⬇ {t.downloadExcel}
            </button>
        </div>
      </div>

      {!script ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-700 rounded-lg text-slate-500">
          {t.empty}
        </div>
      ) : (
        <SceneTable 
            scenes={script.scenes} 
            onGenerateImage={onGenerateImage}
            onRegeneratePrompt={onRegeneratePrompt}
            onOpenImage={onOpenImage}
            lang={lang}
        />
      )}
    </div>
  );
};

export default ScriptDisplay;