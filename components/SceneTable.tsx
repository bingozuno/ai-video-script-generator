import React from 'react';
import type { Scene } from '../types';
import CodeBlock from './CodeBlock';

interface SceneTableProps {
  scenes: Scene[];
  lang?: 'vi' | 'en';
  onGenerateImage: (index: number) => void;
  onRegeneratePrompt: (index: number) => void;
  onOpenImage: (src: string, name: string) => void;
}

const SceneTable: React.FC<SceneTableProps> = ({ scenes, lang = 'vi', onGenerateImage, onRegeneratePrompt, onOpenImage }) => {
  const t = lang === 'vi' ? {
      stt: "STT",
      desc: "MÔ TẢ KỊCH BẢN",
      imgPrompt: "PROMPT TẠO ẢNH",
      motionPrompt: "PROMPT CHUYỂN ĐỘNG",
      result: "ẢNH TẠO RA",
      genImgBtn: "Tạo ảnh",
      regenBtn: "Tạo lại Prompt",
      generating: "Đang tạo..."
  } : {
      stt: "#",
      desc: "SCENE DESCRIPTION",
      imgPrompt: "IMAGE PROMPT",
      motionPrompt: "MOTION PROMPT",
      result: "GENERATED IMAGE",
      genImgBtn: "Generate Image",
      regenBtn: "Regenerate",
      generating: "Generating..."
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-700">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-900 text-slate-400 uppercase font-medium text-xs">
          <tr>
            <th className="px-4 py-3 border-b border-slate-700 w-10">{t.stt}</th>
            <th className="px-4 py-3 border-b border-slate-700 w-1/4">{t.desc}</th>
            <th className="px-4 py-3 border-b border-slate-700 w-1/4">
                {t.imgPrompt} <span className="text-green-500 text-[10px] ml-1">(Đã tạo: {scenes.filter(s => s.generatedImages?.length).length}/{scenes.length})</span>
            </th>
            <th className="px-4 py-3 border-b border-slate-700 w-48">{t.result}</th>
            <th className="px-4 py-3 border-b border-slate-700 w-1/4">
                {t.motionPrompt} <span className="text-purple-400 text-[10px] ml-1">(Đã tạo: {scenes.filter(s => s.motionPrompt && s.motionPrompt !== '{}').length}/{scenes.length})</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700 bg-slate-800/50">
          {scenes.map((scene, index) => (
            <tr key={index} className="hover:bg-slate-700/30 transition-colors" style={{ height: '249px' }}>
              {/* Cột STT */}
              <td className="px-4 py-4 font-mono text-slate-500 align-top h-[249px]">
                  {scene.sceneNumber}
              </td>

              {/* Cột Mô Tả - Giới hạn chiều cao content để không vỡ hàng */}
              <td className="px-4 py-4 align-top h-[249px]">
                <div className="h-[215px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="prose prose-invert prose-sm max-w-none">
                        {scene.description}
                    </div>
                    <div className="mt-2 text-xs text-slate-500 font-mono">Duration: {scene.duration}</div>
                </div>
              </td>

              {/* Cột Prompt Ảnh */}
              <td className="px-4 py-4 align-top space-y-2 h-[249px]">
                <div className="h-[215px] overflow-y-auto pr-2 custom-scrollbar flex flex-col">
                    <CodeBlock code={scene.imagePrompt} language="markdown" maxHeight="150px" />
                    <div className="flex space-x-2 mt-2">
                        <button 
                            onClick={() => onGenerateImage(index)}
                            disabled={scene.isGeneratingImages}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors disabled:opacity-50 flex items-center shrink-0"
                        >
                            {scene.isGeneratingImages ? <span className="animate-spin mr-1">⏳</span> : '🎨'} {scene.isGeneratingImages ? t.generating : t.genImgBtn}
                        </button>
                        <button 
                            onClick={() => onRegeneratePrompt(index)}
                            disabled={scene.isRegeneratingPrompt}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors disabled:opacity-50 shrink-0"
                        >
                            {scene.isRegeneratingPrompt ? '...' : t.regenBtn}
                        </button>
                    </div>
                </div>
              </td>

              {/* Cột Ảnh Kết Quả - Căn giữa ảnh trong khung 249px */}
              <td className="px-4 py-4 align-top h-[249px]">
                 <div className="h-[215px] overflow-y-auto pr-1 flex flex-col justify-start">
                     {scene.generatedImages && scene.generatedImages.length > 0 ? (
                         <div className="grid grid-cols-1 gap-2">
                             {scene.generatedImages.map((imgSrc, i) => (
                                 <img 
                                    key={i} 
                                    src={imgSrc} 
                                    alt={`Scene ${scene.sceneNumber}`} 
                                    className="w-full h-auto rounded border border-slate-600 cursor-pointer hover:opacity-90 object-contain max-h-[210px]"
                                    onClick={() => onOpenImage(imgSrc, `Cảnh ${scene.sceneNumber}`)}
                                 />
                             ))}
                         </div>
                     ) : (
                         <div className="w-full h-full min-h-[100px] bg-slate-800/50 rounded border border-slate-700 flex items-center justify-center text-xs text-slate-500">
                             No Image
                         </div>
                     )}
                 </div>
              </td>

              {/* Cột Motion Prompt */}
              <td className="px-4 py-4 align-top h-[249px]">
                <div className="h-[215px] overflow-y-auto pr-2 custom-scrollbar">
                    <CodeBlock code={scene.motionPrompt} language="json" maxHeight="200px" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SceneTable;