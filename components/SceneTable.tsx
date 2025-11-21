import React from 'react';
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
  <div className="w-full h-full flex items-center justify-center bg-slate-800/50 rounded-md min-h-[120px]">
    {isGenerating ? (
      <div className="flex flex-col items-center text-slate-400">
        <svg className="animate-spin h-6 w-6 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-xs mt-2">Đang tạo...</span>
      </div>
    ) : (
      <div className="text-center text-xs text-slate-500 p-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
        <p>Ảnh sẽ hiện ở đây</p>
      </div>
    )}
  </div>
);


const SceneTable: React.FC<SceneTableProps> = ({ scenes, totalScenes, onGenerateImage, onRegeneratePrompt, onOpenImage }) => {
  return (
    <div className="overflow-x-auto shadow-xl rounded-lg border border-slate-700">
      <table className="min-w-full divide-y divide-slate-700">
        <thead className="bg-slate-800">
          <tr>
            {/* STT: Cực hẹp (3%) */}
            <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider w-[3%]">STT</th>
            
            {/* ĐÃ BỎ CỘT THỜI GIAN */}
            
            {/* Mô tả: Hẹp vừa phải (20%) */}
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider w-[20%]">Mô tả Kịch bản</th>
            
            {/* Prompt Ảnh: Rộng nhất (40%) */}
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider w-[40%]">
              Prompt Tạo Ảnh
              <div className="text-[10px] text-green-400 normal-case mt-0.5 font-bold">
                (Đã tạo: {scenes.length}/{totalScenes})
              </div>
            </th>
            
            {/* Ảnh: (15%) */}
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider w-[15%]">Ảnh tạo ra</th>
            
            {/* Prompt Video: (22%) */}
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider w-[22%]">
              Prompt Chuyển động
              <div className="text-[10px] text-purple-400 normal-case mt-0.5 font-bold">
                (Đã tạo: {scenes.length}/{totalScenes})
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="bg-slate-900 divide-y divide-slate-800">
          {scenes.map((scene, index) => (
            <tr key={index} className="hover:bg-slate-800/50 transition-colors">
              <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-slate-200 align-top">{scene.sceneNumber}</td>
              
              <td className="px-4 py-4 text-sm text-slate-300 align-top leading-relaxed">
                <p className="max-h-40 overflow-y-auto custom-scrollbar pr-1">{scene.description}</p>
              </td>
              
              <td className="px-4 py-4 text-sm text-slate-300 align-top">
                <div className="flex flex-col space-y-2">
                  <CodeBlock code={scene.imagePrompt} />
                  <div className="flex space-x-2 mt-1">
                      {/* Nút Tạo Ảnh */}
                      <button 
                        onClick={() => onGenerateImage(index)}
                        disabled={scene.isGeneratingImages}
                        className="flex-1 inline-flex items-center justify-center px-2 py-1.5 border border-transparent text-xs font-bold rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500"
                      >
                        {scene.isGeneratingImages ? 'Đang vẽ...' : 'Tạo ảnh'}
                      </button>

                      {/* Nút Tạo lại Prompt (Xanh lá) */}
                      <button 
                        onClick={() => onRegeneratePrompt(index)}
                        disabled={scene.isRegeneratingPrompt}
                        className="inline-flex items-center justify-center px-2 py-1.5 border border-transparent text-xs font-bold rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-green-500"
                        title="AI viết lại prompt để sửa lỗi nhân vật"
                      >
                         {scene.isRegeneratingPrompt ? (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                         ) : (
                            <span>Tạo lại</span>
                         )}
                      </button>
                  </div>
                </div>
              </td>
              
              <td className="px-4 py-4 text-sm text-slate-300 align-top">
                {scene.generatedImages && scene.generatedImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {scene.generatedImages.map((imgSrc, imgIndex) => (
                      <button 
                        key={imgIndex} 
                        onClick={() => onOpenImage(imgSrc, `scene-${scene.sceneNumber.replace(/\s+/g, '_')}-img-${imgIndex + 1}.png`)}
                        className="block w-full h-auto rounded-md bg-slate-800 overflow-hidden group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500"
                      >
                         <img 
                            src={imgSrc} 
                            alt={`Img ${imgIndex + 1}`} 
                            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" 
                         />
                      </button>
                    ))}
                  </div>
                ) : (
                  <ImageGenerationPlaceholder isGenerating={!!scene.isGeneratingImages} />
                )}
              </td>
              
              <td className="px-4 py-4 text-sm text-slate-300 align-top">
                  <CodeBlock code={scene.motionPrompt} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SceneTable;