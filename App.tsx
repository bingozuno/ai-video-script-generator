import React, { useState } from 'react';
import ScriptGenerator from './ScriptGenerator';
import WatermarkRemover from './WatermarkRemover';

// --- CÁC ICON (Giữ nguyên) ---
const ZaloIcon: React.FC = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12c0 3.86 2.14 7.25 5.33 9.07V23l3.5-2.52C11.23 20.83 11.61 21 12 21c5.52 0 10-4.48 10-9S17.52 2 12 2z"/>
  </svg>
);
const YoutubeIcon: React.FC = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
);
const TiktokIcon: React.FC = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.1.03-4.15-.48-5.66-1.61-1.66-1.24-2.6-3.08-2.63-5.06-.02-1.3.31-2.58 1.02-3.66.83-1.27 2.11-2.1 3.54-2.28.62-.08 1.25-.09 1.87-.08v3.98c-.44.01-.88.07-1.32.19-1.05.28-1.92 1-2.35 1.99-.21.51-.33 1.05-.34 1.59-.01.62.11 1.23.36 1.81.38.88 1.12 1.47 1.99 1.61.97.16 1.97-.02 2.82-.44.86-.43 1.52-1.11 1.86-1.99.16-.43.25-.88.26-1.34.02-4.12.01-8.24.01-12.36Z"/>
    </svg>
);
// --- KẾT THÚC ICON ---


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('scriptGenerator');
  
  // --- THÊM MỚI: State để lưu API Key ---
  const [apiKey, setApiKey] = useState<string>('');
  // ------------------------------------

  const TabButton = ({ tabId, label }: { tabId: string; label: string }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-6 py-3 text-base font-semibold rounded-t-lg transition-colors focus:outline-none border-b-2 ${
        activeTab === tabId
          ? 'text-cyan-300 border-cyan-400'
          : 'text-slate-400 hover:text-white border-transparent'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-200">
      <nav className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center border-b border-slate-700">
                  <div>
                    <TabButton tabId="scriptGenerator" label="Tạo Kịch Bản Video" />
                    <TabButton tabId="watermarkRemover" label="AI Xóa Watermark" />
                  </div>
                  <div className="flex items-center space-x-6">
                      <a href="https://zalo.me/g/mhxlhv216" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-slate-400 hover:text-white transition-colors" title="Cộng đồng Zalo">
                          <ZaloIcon />
                          <span className="text-xs mt-1">Zalo</span>
                      </a>
                       <a href="https://www.youtube.com/channel/UCFhWGw9eTCgp2bmbuimkurg" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-slate-400 hover:text-white transition-colors" title="Kênh Youtube">
                          <YoutubeIcon />
                           <span className="text-xs mt-1">YouTube</span>
                      </a>
                      <a href="https://www.tiktok.com/@chuyendramagiadinh" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-slate-400 hover:text-white transition-colors" title="Kênh Tiktok">
                           <TiktokIcon />
                           <span className="text-xs mt-1">TikTok</span>
                      </a>
                  </div>
              </div>
          </div>
      </nav>
      
      {/* --- THÊM MỚI: Khu vực nhập API Key --- */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-slate-700 bg-slate-800/50">
        <label htmlFor="api-key-input" className="block text-sm font-medium text-yellow-400 mb-2">
          Gemini API Key
        </label>
        <div className="flex">
          <input
            id="api-key-input"
            type="password"
            placeholder="Dán Gemini API Key của bạn vào đây (Key sẽ không được lưu)"
            className="flex-grow bg-slate-700 border border-slate-600 rounded-l-md p-2 text-sm text-slate-200 focus:ring-1 focus:ring-yellow-500 placeholder-slate-400"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 px-4 py-2 bg-yellow-600 text-slate-900 rounded-r-md text-sm font-semibold hover:bg-yellow-700 transition-colors"
          >
            Lấy Key
          </a>
        </div>
      </div>
      {/* ------------------------------------ */}

      {/* SỬA LẠI 2 DÒNG DƯỚI ĐÂY:
        Chúng ta truyền `apiKey` vào làm một "prop" cho 2 component con
      */}
      <div style={{ display: activeTab === 'scriptGenerator' ? 'block' : 'none' }}>
        <ScriptGenerator apiKey={apiKey} />
      </div>
      <div style={{ display: activeTab === 'watermarkRemover' ? 'block' : 'none' }}>
        <WatermarkRemover apiKey={apiKey} />
      </div>
    </div>
  );
};

export default App;