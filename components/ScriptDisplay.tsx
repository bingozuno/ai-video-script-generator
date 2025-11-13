import React from 'react';
import type { Script, StoryChapter } from '../types';
import SceneTable from './SceneTable';

interface ScriptDisplayProps {
  script: Script | null;
  storyChapters: StoryChapter[];
  isLoading: boolean;
  error: string | null;
  onGenerateImage: (sceneIndex: number) => void;
  onOpenImage: (src: string, name: string) => void;
}

const ScriptDisplay: React.FC<ScriptDisplayProps> = ({ script, storyChapters, isLoading, error, onGenerateImage, onOpenImage }) => {

  const downloadFile = (filename: string, content: string, mimeType: string) => {
    // Add BOM for UTF-8 compatibility in Excel, especially for CSV
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

  const handleDownloadChapters = () => {
    if (!storyChapters || storyChapters.length === 0) {
      alert("Không có nội dung chương để tải về.");
      return;
    }
    const content = storyChapters.map(chapter => chapter.text).join('\n\n');
    downloadFile('kich_ban_chuong.txt', content, 'text/plain;charset=utf-8');
  };

  const handleDownloadTxt = () => {
    if (!script?.scenes || script.scenes.length === 0) {
      alert("Không có prompt tạo ảnh để tải về.");
      return;
    }
    const content = script.scenes.map(scene => scene.imagePrompt).join('\n\n');
    downloadFile('prompts_tao_anh.txt', content, 'text/plain;charset=utf-8;');
  };
  
  const handleDownloadExcel = () => {
    if (!script?.scenes || script.scenes.length === 0) {
      alert("Không có phân cảnh chi tiết để tải về.");
      return;
    };
    
    // Fix: Re-implemented for robustness to ensure prompt content is always included.
    const header = '"STT","Prompt","Trạng Thái"\n';
    
    const escapeCsvField = (field: string) => `"${(field || '').replace(/"/g, '""')}"`;
    
    const rows = script.scenes.map((scene, index) => {
      const imagePrompt = scene.imagePrompt || '';
      const motionPrompt = scene.motionPrompt || '';

      let motionPromptObject: any;
      try {
        motionPromptObject = JSON.parse(motionPrompt);
      } catch (e) {
        motionPromptObject = { "info": motionPrompt };
      }

      const combinedPrompt = JSON.stringify({
        image_prompt: imagePrompt,
        motion_prompt: motionPromptObject
      }, null, 2);
      
      const stt = escapeCsvField(String(index + 1));
      const promptJson = escapeCsvField(combinedPrompt);
      const trangThai = escapeCsvField('');
      
      return [stt, promptJson, trangThai].join(',');
    }).join('\n');
    
    const csvContent = header + rows;
    downloadFile('prompts_video.csv', csvContent, 'text/csv;charset=utf-8;');
  };

  const scenes = script?.scenes || [];

  return (
    <div className="mt-8 space-y-6">
       {isLoading && (
        <div className="text-center">
            <div className="flex justify-center items-center">
            <svg className="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="http://www.w3.org/2000/svg">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="ml-4 text-slate-300 text-lg">AI đang sáng tạo kịch bản, vui lòng chờ trong giây lát...</p>
            </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300">
            <h3 className="font-bold">Đã xảy ra lỗi</h3>
            <p className="mt-2 text-sm">{error}</p>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Bảng Phân Cảnh Chi Tiết
          </h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadChapters}
              disabled={storyChapters.length === 0}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-semibold rounded-md text-slate-900 bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-yellow-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
              title="Tải về toàn bộ các chương dưới dạng file .txt"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Tải kịch bản chương
            </button>
            <button
              onClick={handleDownloadTxt}
              disabled={!script}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-semibold rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-green-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
              title="Tải toàn bộ prompt tạo ảnh dưới dạng file .txt"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Tải Prompt Tạo Ảnh File TXT
            </button>
            <button
              onClick={handleDownloadExcel}
              disabled={!script}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-semibold rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-pink-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
              title="Tải bảng quản lý prompt dưới dạng file .csv (mở bằng Excel)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Tải File Excel
            </button>
          </div>
        </div>
        <SceneTable scenes={scenes} onGenerateImage={onGenerateImage} onOpenImage={onOpenImage} />
         {scenes.length === 0 && !isLoading && (
            <div className="text-center py-10 border-2 border-dashed border-slate-700 rounded-lg mt-4">
                <p className="text-slate-500">Bảng phân cảnh chi tiết sẽ xuất hiện ở đây.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ScriptDisplay;