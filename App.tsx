import React, { useState, useEffect } from 'react';
import ScriptGenerator from './ScriptGenerator';
import WatermarkRemover from './WatermarkRemover';

// --- CÁC ICON MẠNG XÃ HỘI ---

const ZaloIcon: React.FC = () => (
  // Icon Zalo: Hình vuông bo góc xanh dương, CHỮ 'Zalo' chuẩn text
  <svg className="w-8 h-8 hover:scale-110 transition-transform duration-200" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="10" fill="#0068FF"/>
    {/* Sử dụng text SVG để đảm bảo chữ Zalo hiển thị đúng chính tả và rõ ràng */}
    <text x="50%" y="65%" textAnchor="middle" fill="white" fontSize="18" fontFamily="Verdana, sans-serif" fontWeight="900">Zalo</text>
  </svg>
);

const YoutubeIcon: React.FC = () => (
  // Icon YouTube: Hình tròn đỏ
  <svg className="w-8 h-8 hover:scale-110 transition-transform duration-200" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="24" fill="#FF0000"/>
    <path d="M32 24L18 32V16L32 24Z" fill="white"/>
  </svg>
);

const TiktokIcon: React.FC = () => (
  // Icon TikTok: Hình tròn đen
  <svg className="w-8 h-8 hover:scale-110 transition-transform duration-200" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="24" fill="#000000"/>
    <path d="M33 15C33 15 30.5 15.5 29 14V27.5C29 32 25.5 33 23.5 32C21.5 31 20 29 21 26.5C22 24 25 24.5 25 24.5V20C25 20 19.5 19 16.5 23.5C13.5 28 16 34 21.5 35.5C27 37 31.5 34 33 29.5V22C33 22 35.5 23 37 23.5V18C37 18 35 17.5 33 15Z" fill="white"/>
  </svg>
);

const FacebookIcon: React.FC = () => (
  // Icon Facebook: Hình tròn xanh dương
  <svg className="w-8 h-8 hover:scale-110 transition-transform duration-200" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="24" fill="#1877F2"/>
    <path d="M26.5 36V24H30L31 19H26.5V17C26.5 16 27 15 28.5 15H30V11H27C23.5 11 21.5 12.5 21.5 16.5V19H18V24H21.5V36H26.5Z" fill="white"/>
  </svg>
);
// --- KẾT THÚC ICON ---


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('scriptGenerator');
  const [apiKey, setApiKey] = useState<string>('');

  // TÊN KEY ĐỂ LƯU TRỮ
  const STORAGE_KEY = 'gemini-api-key';

  // Tự động tải key khi mở App
  useEffect(() => {
    const savedKey = localStorage.getItem(STORAGE_KEY);
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSaveKey = () => {
    localStorage.setItem(STORAGE_KEY, apiKey);
    alert('Đã lưu API Key vào trình duyệt!');
  };

  const handleClearKey = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey('');
    alert('Đã xóa API Key khỏi trình duyệt!');
  };

  const TabButton = ({ tabId, label }: { tabId: string; label: string }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-semibold rounded-t-lg transition-colors focus:outline-none border-b-2 ${
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
              <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-700 py-2">
                  {/* Khu vực Tab bên trái */}
                  <div className="flex mb-4 md:mb-0">
                    <TabButton tabId="scriptGenerator" label="Tạo Kịch Bản Video" />
                    <TabButton tabId="watermarkRemover" label="AI Xóa Watermark" />
                  </div>

                  {/* Khu vực Mạng xã hội bên phải (Căn chỉnh thẳng hàng) */}
                  <div className="flex items-center space-x-6">
                      {/* Nút Zalo */}
                      <a 
                        href="https://drive.google.com/file/d/1tvN5fsdJAUSX_Cl820yoceM6gTEEMvAG/view?usp=sharing" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex flex-col items-center group" 
                        title="Tham gia nhóm Zalo"
                      >
                          <ZaloIcon />
                          <span className="text-[10px] sm:text-xs mt-1 font-medium text-slate-400 group-hover:text-white transition-colors">Zalo</span>
                      </a>

                      {/* Nút YouTube */}
                      <a 
                        href="https://www.youtube.com/channel/UCFhWGw9eTCgp2bmbuimkurg" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex flex-col items-center group" 
                        title="Kênh YouTube"
                      >
                          <YoutubeIcon />
                          <span className="text-[10px] sm:text-xs mt-1 font-medium text-slate-400 group-hover:text-white transition-colors">YouTube</span>
                      </a>

                      {/* Nút TikTok */}
                      <a 
                        href="https://www.tiktok.com/@chuyendramagiadinh" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex flex-col items-center group" 
                        title="Kênh TikTok"
                      >
                           <TiktokIcon />
                           <span className="text-[10px] sm:text-xs mt-1 font-medium text-slate-400 group-hover:text-white transition-colors">TikTok</span>
                      </a>

                      {/* Nút Facebook */}
                      <a 
                        href="https://www.facebook.com/ToolsElevenlabsPro" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex flex-col items-center group" 
                        title="Trang Facebook"
                      >
                           <FacebookIcon />
                           <span className="text-[10px] sm:text-xs mt-1 font-medium text-slate-400 group-hover:text-white transition-colors">Facebook</span>
                      </a>
                  </div>
              </div>
          </div>
      </nav>
      
      {/* Khu vực nhập API Key */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-slate-700 bg-slate-800/50">
        <label htmlFor="api-key-input" className="block text-sm font-medium text-yellow-400 mb-2">
          Gemini API Key (Đã lưu vào trình duyệt của bạn)
        </label>
        <div className="flex">
          <input
            id="api-key-input"
            type="password"
            placeholder="Dán Gemini API Key của bạn vào đây..."
            className="flex-grow bg-slate-700 border border-slate-600 rounded-l-md p-2 text-sm text-slate-200 focus:ring-1 focus:ring-yellow-500 placeholder-slate-400"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 px-4 py-2 bg-yellow-600 text-slate-900 text-sm font-semibold hover:bg-yellow-700 transition-colors flex items-center"
          >
            Lấy Key
          </a>
          
          <button
            type="button"
            onClick={handleSaveKey}
            className="flex-shrink-0 px-4 py-2 bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            Lưu Key
          </button>
          
          <button
            type="button"
            onClick={handleClearKey}
            className="flex-shrink-0 px-4 py-2 bg-red-600 text-white rounded-r-md text-sm font-semibold hover:bg-red-700 transition-colors"
          >
            Xóa Key
          </button>

        </div>
      </div>

      {/* Nội dung chính */}
      <div style={{ display: activeTab === 'scriptGenerator' ? 'block' : 'none' }}>
        <ScriptGenerator />
      </div>
      <div style={{ display: activeTab === 'watermarkRemover' ? 'block' : 'none' }}>
        <WatermarkRemover />
      </div>
    </div>
  );
};

export default App;