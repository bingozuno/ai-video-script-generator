import React, { useState, useEffect } from 'react';
import ScriptGenerator from './ScriptGenerator';
import WatermarkRemover from './WatermarkRemover';

// --- CẤU HÌNH MẬT KHẨU ---
const APP_PASSWORD = '111111111'; 
const AUTH_STORAGE_KEY = 'app-auth-token'; 

const App: React.FC = () => {
  // --- TRẠNG THÁI (STATE) ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('scriptGenerator');
  const [apiKey, setApiKey] = useState<string>('');
  
  const API_STORAGE_KEY = 'gemini-api-key';

  // --- USE EFFECT: TỰ ĐỘNG LOAD KHI MỞ WEB ---
  useEffect(() => {
    // 1. Load API Key từ bộ nhớ
    const savedKey = localStorage.getItem(API_STORAGE_KEY);
    if (savedKey) {
      setApiKey(savedKey);
    }

    // 2. Kiểm tra Đăng nhập
    const savedAuthToken = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedAuthToken === APP_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      if (savedAuthToken) localStorage.removeItem(AUTH_STORAGE_KEY);
      setIsAuthenticated(false);
    }
  }, []);

  // --- CÁC HÀM XỬ LÝ (HANDLERS) ---
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passwordInput === APP_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_STORAGE_KEY, APP_PASSWORD);
      setAuthError('');
    } else {
      setAuthError('Mật khẩu không đúng, vui lòng thử lại!');
    }
  };

  const handleSaveKey = () => {
    localStorage.setItem(API_STORAGE_KEY, apiKey);
    alert('Đã lưu API Key vào trình duyệt!');
  };

  const handleClearKey = () => {
    localStorage.removeItem(API_STORAGE_KEY);
    setApiKey('');
    alert('Đã xóa API Key khỏi trình duyệt!');
  };

  // Component con: Nút chuyển Tab
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

  // --- GIAO DIỆN 1: MÀN HÌNH ĐĂNG NHẬP ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 font-sans text-slate-200 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
          <h2 className="text-2xl font-bold text-center mb-6 text-cyan-400">Xác thực người dùng</h2>
          <p className="text-slate-400 text-center mb-6 text-sm">Hệ thống đã được cập nhật bảo mật.<br/>Vui lòng nhập mật khẩu mới để truy cập.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="password" 
                placeholder="Nhập mật khẩu..." 
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none text-white transition-all" 
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)} 
              />
            </div>
            {authError && <p className="text-red-500 text-sm text-center font-medium animate-pulse">{authError}</p>}
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg shadow-lg transform transition hover:scale-[1.02] active:scale-95">Truy cập ngay</button>
          </form>
        </div>
      </div>
    );
  }

  // --- GIAO DIỆN 2: ỨNG DỤNG CHÍNH (SAU KHI ĐĂNG NHẬP) ---
  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-200">
      
      {/* 1. THANH ĐIỀU HƯỚNG (NAVBAR) */}
      <nav className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-700 py-2">
                  
                  {/* Tab chọn tính năng */}
                  <div className="flex mb-4 md:mb-0">
                    <TabButton tabId="scriptGenerator" label="Tạo Kịch Bản Video" />
                    <TabButton tabId="watermarkRemover" label="AI Xóa Watermark" />
                  </div>

                  {/* Icon Mạng xã hội & App Store */}
                  <div className="flex items-center space-x-6">
                      
                      {/* App Store (Dùng đúng tên file: "App Store.png") */}
                      <a href="https://tiendungjxd.my.canva.site/" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group" title="App Store">
                          <img src="/App Store.png" alt="App Store" className="w-8 h-8 object-contain hover:scale-110 transition-transform duration-200"/>
                          <span className="text-[10px] sm:text-xs mt-1 font-medium text-slate-400 group-hover:text-white transition-colors">App Store</span>
                      </a>

                      {/* Zalo (Dùng đúng tên file: "Zalo.png") */}
                      <a href="https://drive.google.com/file/d/1tvN5fsdJAUSX_Cl820yoceM6gTEEMvAG/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group" title="Tham gia nhóm Zalo">
                          <img src="/Zalo.png" alt="Zalo" className="w-8 h-8 object-contain hover:scale-110 transition-transform duration-200"/>
                          <span className="text-[10px] sm:text-xs mt-1 font-medium text-slate-400 group-hover:text-white transition-colors">Zalo</span>
                      </a>

                      {/* YouTube (Dùng đúng tên file: "Youtube.png") */}
                      <a href="https://www.youtube.com/channel/UCFhWGw9eTCgp2bmbuimkurg" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group" title="Kênh YouTube">
                          <img src="/Youtube.png" alt="YouTube" className="w-8 h-8 object-contain hover:scale-110 transition-transform duration-200"/>
                          <span className="text-[10px] sm:text-xs mt-1 font-medium text-slate-400 group-hover:text-white transition-colors">YouTube</span>
                      </a>

                      {/* TikTok (Dùng đúng tên file: "Tiktok.png") */}
                      <a href="https://www.tiktok.com/@chuyendramagiadinh" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group" title="Kênh TikTok">
                           <img src="/Tiktok.png" alt="TikTok" className="w-8 h-8 object-contain hover:scale-110 transition-transform duration-200"/>
                           <span className="text-[10px] sm:text-xs mt-1 font-medium text-slate-400 group-hover:text-white transition-colors">TikTok</span>
                      </a>

                      {/* Facebook (Dùng đúng tên file: "Facebook.png") */}
                      <a href="https://www.facebook.com/ToolsElevenlabsPro" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group" title="Trang Facebook">
                           <img src="/Facebook.png" alt="Facebook" className="w-8 h-8 object-contain hover:scale-110 transition-transform duration-200"/>
                           <span className="text-[10px] sm:text-xs mt-1 font-medium text-slate-400 group-hover:text-white transition-colors">Facebook</span>
                      </a>
                  </div>
              </div>
          </div>
      </nav>
      
      {/* 2. KHU VỰC NHẬP API KEY */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-slate-700 bg-slate-800/50">
        <label htmlFor="api-key-input" className="block text-sm font-medium text-yellow-400 mb-2">Gemini API Key (Đã lưu vào trình duyệt của bạn)</label>
        <div className="flex">
          <input 
            id="api-key-input" 
            type="password" 
            placeholder="Dán Gemini API Key của bạn vào đây..." 
            className="flex-grow bg-slate-700 border border-slate-600 rounded-l-md p-2 text-sm text-slate-200 focus:ring-1 focus:ring-yellow-500 placeholder-slate-400" 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)}
          />
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 px-4 py-2 bg-yellow-600 text-slate-900 text-sm font-semibold hover:bg-yellow-700 transition-colors flex items-center">Lấy Key</a>
          <button type="button" onClick={handleSaveKey} className="flex-shrink-0 px-4 py-2 bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors">Lưu Key</button>
          <button type="button" onClick={handleClearKey} className="flex-shrink-0 px-4 py-2 bg-red-600 text-white rounded-r-md text-sm font-semibold hover:bg-red-700 transition-colors">Xóa Key</button>
        </div>
      </div>

      {/* 3. NỘI DUNG ỨNG DỤNG */}
      <div style={{ display: activeTab === 'scriptGenerator' ? 'block' : 'none' }}>
        <ScriptGenerator apiKey={apiKey} />
      </div>
      <div style={{ display: activeTab === 'watermarkRemover' ? 'block' : 'none' }}>
        <WatermarkRemover />
      </div>

    </div>
  );
};

export default App;