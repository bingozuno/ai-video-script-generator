
import React from 'react';
import type { Script, StoryChapter } from '../types';
import SceneTable from './SceneTable';

interface ScriptDisplayProps {
  t: any;
  lang: string;
  script: Script | null;
  isLoading: boolean;
  error: string | null;
  storyChapters: StoryChapter[];
  onGenerateImage: (sceneIndex: number) => void;
  onRegenerateImagePrompt: (sceneIndex: number) => void;
  onOpenImage: (src: string, name: string) => void;
}

const ScriptDisplay: React.FC<ScriptDisplayProps> = ({ t, lang, script, isLoading, error, storyChapters, onGenerateImage, onRegenerateImagePrompt, onOpenImage }) => {

  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const bom = mimeType.includes('csv') ? '\uFEFF' : '';
    const blob = new Blob([bom + content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadImagePrompts = () => {
    if (!script?.scenes || script.scenes.length === 0) {
      alert(lang === 'vi' ? "Không có prompt để tải về." : "No prompts to download.");
      return;
    }
    const content = script.scenes
      .map(scene => (scene.imagePrompt || '').trim().replace(/\r\n/g, '\n').replace(/\n{2,}/g, '\n'))
      .join('\n\n');
    const fileName = lang === 'vi' ? 'Prompt Tạo Ảnh.txt' : 'Image Prompts.txt';
    downloadFile(fileName, content, 'text/plain;charset=utf-8;');
  };
  
  const handleDownloadMotionPrompts = () => {
    if (!script?.scenes || script.scenes.length === 0) {
      alert(lang === 'vi' ? "Không có prompt chuyển động để tải về." : "No motion prompts to download.");
      return;
    };
    
    const content = script.scenes
      .map(scene => (scene.motionPrompt || '').trim())
      .join('\n\n');
    
    const fileName = lang === 'vi' ? 'Prompt Video.txt' : 'Video Prompts.txt';
    downloadFile(fileName, content, 'text/plain;charset=utf-8;');
  };
  
  const handleDownloadChapters = () => {
    if (!storyChapters || storyChapters.length === 0 || storyChapters.every(c => !c.text.trim())) {
      alert(lang === 'vi' ? "Không có nội dung chương để tải về." : "No chapter content to download.");
      return;
    }
    const content = storyChapters
      .map(chapter => (chapter.text || '').trim())
      .join('\n\n');
    const fileName = lang === 'vi' ? 'Kịch bản chương.txt' : 'Chapters Script.txt';
    downloadFile(fileName, content, 'text/plain;charset=utf-8;');
  };

  const scenes = script?.scenes || [];

  return (
    <div className="mt-8 space-y-6">
       {isLoading && (
        <div className="text-center">
            <div className="flex justify-center items-center">
            <svg className="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="ml-4 text-slate-300 text-lg">{lang === 'vi' ? 'AI đang sáng tạo Prompts, vui lòng chờ trong giây lát...' : 'AI is creating Prompts, please wait a moment...'}</p>
            </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300">
            <h3 className="font-bold">{lang === 'vi' ? 'Đã xảy ra lỗi' : 'An error occurred'}</h3>
            <p className="mt-2 text-sm">{error}</p>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            {t.scenes_title}
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadImagePrompts}
              disabled={!script}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
              title={t.download_txt}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              {t.download_txt}
            </button>
            <button
              onClick={handleDownloadMotionPrompts}
              disabled={!script}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-semibold rounded-md text-slate-900 bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-yellow-400 transition-colors disabled:bg-slate-600 disabled:text-slate-300 disabled:cursor-not-allowed"
              title={t.download_motion_txt}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              {t.download_motion_txt}
            </button>
             <button
              onClick={handleDownloadChapters}
              disabled={!storyChapters || storyChapters.every(c => !c.text.trim())}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-semibold rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-green-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
              title={t.download_chapters_txt}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              {t.download_chapters_txt}
            </button>
          </div>
        </div>
        <SceneTable t={t} scenes={scenes} onGenerateImage={onGenerateImage} onRegenerateImagePrompt={onRegenerateImagePrompt} onOpenImage={onOpenImage} />
         {scenes.length === 0 && !isLoading && (
            <div className="text-center py-10 border-2 border-dashed border-slate-700 rounded-lg mt-4">
                <p className="text-slate-500">{lang === 'vi' ? 'Bảng phân cảnh chi tiết sẽ xuất hiện ở đây.' : 'Detailed scene breakdown will appear here.'}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ScriptDisplay;
