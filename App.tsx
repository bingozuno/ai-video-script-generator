import React, { useState, useEffect } from 'react';
import ScriptGenerator from './ScriptGenerator';
import WatermarkRemover from './WatermarkRemover';
import { Translation, Language } from './types'; 

// --- CẤU HÌNH MẬT KHẨU ---
const APP_PASSWORD = '111111111'; 
const AUTH_STORAGE_KEY = 'app-auth-token'; 

// --- TỪ ĐIỂN NGÔN NGỮ ---
const translations: Record<Language, Translation> = {
  vi: {
    title: "AI Video Script Generator",
    headerTitle: "Chia Cảnh & Tạo Prompt, Tạo Ảnh Trước Khi Tạo Voice",
    headerSubtitle: "Biến ý tưởng của bạn thành kịch bản video chi tiết...",
    developedBy: "PHÁT TRIỂN BỞI TIẾN DŨNG JXD",
    apiKeyLabel: "Gemini API Key (Đã lưu vào trình duyệt của bạn)",
    getKey: "Lấy Key",
    save: "Lưu",
    delete: "Xóa",
    savedMsg: "Đã lưu API Key!",
    deletedMsg: "Đã xóa API Key!",
    ideaMode: "Từ Ý Tưởng",
    scriptMode: "Từ Kịch Bản",
    inputPlaceholder: "Nhập nội dung...",
    styleLabel: "Phong cách",
    ratioLabel: "Tỉ lệ",
    generateBtn: "Tạo Kịch Bản",
    generatingBtn: "Đang tạo...",
    tabScript: "Tạo Kịch Bản Video",
    tabWatermark: "AI Xóa Watermark",
    buyCoffee: "Mời tôi 1 ly cafe",
    coffeeTitle: "Mời tôi một ly cà phê",
    coffeeDesc1: "Công cụ miễn phí này được tạo ra bởi “TIẾN DŨNG JXD”.",
    coffeeDesc2: "Nếu bạn cảm thấy hài lòng, một ly cà phê nhỏ từ bạn qua mã QR sẽ là nguồn động lực lớn để tôi tiếp tục phát triển thêm nhiều tiện ích hữu ích cho cộng đồng. Cảm ơn bạn rất nhiều!",
    close: "Đóng"
  },
  en: {
    title: "AI Video Script Generator",
    headerTitle: "Scene Splitting & Prompt Gen, Image Gen Before Voice",
    headerSubtitle: "Turn your ideas into detailed video scripts...",
    developedBy: "DEVELOPED BY TIẾN DŨNG JXD",
    apiKeyLabel: "Gemini API Key (Saved in browser)",
    getKey: "Get Key",
    save: "Save",
    delete: "Delete",
    savedMsg: "API Key Saved!",
    deletedMsg: "API Key Deleted!",
    ideaMode: "From Idea",
    scriptMode: "From Script",
    inputPlaceholder: "Enter content...",
    styleLabel: "Style",
    ratioLabel: "Aspect Ratio",
    generateBtn: "Generate Script",
    generatingBtn: "Generating...",
    tabScript: "Video Script Gen",
    tabWatermark: "Watermark Remover",
    buyCoffee: "Buy me a coffee",
    coffeeTitle: "Buy me a coffee",
    coffeeDesc1: "This free tool was created by “TIẾN DŨNG JXD”.",
    coffeeDesc2: "If you find it useful, a small coffee via QR code would be a great motivation for me to continue developing more useful tools for the community. Thank you very much!",
    close: "Close"
  }
};

const App: React.FC = () => {
  // --- STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState('scriptGenerator');
  const [apiKey, setApiKey] = useState<string>('');
  const [lang, setLang] = useState<Language>('vi'); // Mặc định VI
  const [showQR, setShowQR] = useState(false); // State hiện QR

  const API_STORAGE_KEY = 'gemini-api-key';

  // --- AUTO DETECT LANGUAGE & LOGIN ---
  useEffect(() => {
    // 1. Detect Lang
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('vi')) setLang('vi');
    else setLang('en');

    // 2. Load API Key
    const savedKey = localStorage.getItem(API_STORAGE_KEY);
    if (savedKey) setApiKey(savedKey);

    // 3. Check Login
    const savedAuthToken = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedAuthToken === APP_PASSWORD) setIsAuthenticated(true);
    else { if (savedAuthToken) localStorage.removeItem(AUTH_STORAGE_KEY); setIsAuthenticated(false); }
  }, []);

  const t = translations[lang]; // Lấy text theo ngôn ngữ hiện tại

  // --- HANDLERS ---
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passwordInput === APP_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_STORAGE_KEY, APP_PASSWORD);
      setAuthError('');
    } else { setAuthError('Mật khẩu không đúng!'); }
  };

  const handleSaveKey = () => { localStorage.setItem(API_STORAGE_KEY, apiKey); alert(t.savedMsg); };
  const handleClearKey = () => { localStorage.removeItem(API_STORAGE_KEY); setApiKey(''); alert(t.deletedMsg); };

  // --- CALLBACK KHI TẠO XONG HẾT ---
  const handleGenerationFinished = () => {
    setShowQR(true); // Tự động bật Modal QR
  };

  const TabButton = ({ tabId, label }: { tabId: string; label: string }) => (
    <button onClick={() => setActiveTab(tabId)} className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-semibold rounded-t-lg transition-colors focus:outline-none border-b-2 ${activeTab === tabId ? 'text-cyan-300 border-cyan-400' : 'text-slate-400 hover:text-white border-transparent'}`}>
      {label}
    </button>
  );

  // --- LOGIN UI ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 font-sans text-slate-200 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
          <h2 className="text-2xl font-bold text-center mb-6 text-cyan-400">Xác thực người dùng</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="Mật khẩu..." className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} />
            {authError && <p className="text-red-500 text-sm text-center animate-pulse">{authError}</p>}
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg">Truy cập</button>
          </form>
        </div>
      </div>
    );
  }

  // --- MAIN UI ---
  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-200 relative">
      
      {/* MODAL QR CODE (Hiện khi showQR = true) */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300" onClick={() => setShowQR(false)}>
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-600 shadow-2xl max-w-sm w-full text-center relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowQR(false)} className="absolute top-2 right-3 text-slate-400 hover:text-white text-xl">&times;</button>
            <h3 className="text-xl font-bold text-yellow-400 mb-4">{t.coffeeTitle}</h3>
            
            <div className="bg-white p-2 rounded-lg inline-block mb-4">
               {/* ẢNH QR - ĐƯỜNG DẪN /QR.png */}
               <img src="/QR.png" alt="QR Code" className="w-48 h-48 object-contain" />
            </div>

            <div className="text-slate-300 text-sm space-y-2">
              <p className="font-semibold text-cyan-300">{t.coffeeDesc1}</p>
              <p>{t.coffeeDesc2}</p>
            </div>
            
            <button onClick={() => setShowQR(false)} className="mt-6 px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-full text-white text-sm font-medium transition-colors">
              {t.close}
            </button>
          </div>
        </div>
      )}

      <nav className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center border-b border-slate-700 py-2 gap-4 md:gap-0">
                  
                  {/* Tabs */}
                  <div className="flex mb-2 md:mb-0">
                    <TabButton tabId="scriptGenerator" label={t.tabScript} />
                    <TabButton tabId="watermarkRemover" label={t.tabWatermark} />
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center space-x-4 flex-wrap justify-center">
                      
                      {/* NÚT NGÔN NGỮ */}
                      <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                        <button onClick={() => setLang('vi')} className={`px-2 py-1 text-xs font-bold rounded ${lang === 'vi' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}>VN</button>
                        <button onClick={() => setLang('en')} className={`px-2 py-1 text-xs font-bold rounded ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>EN</button>
                      </div>

                      {/* NÚT CAFE */}
                      <button 
                        onClick={() => setShowQR(true)}
                        className="flex items-center px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/40 border border-yellow-500/50 text-yellow-300 rounded-full text-xs font-bold transition-all group"
                      >
                        <span className="mr-1 text-base group-hover:animate-bounce">☕</span>
                        {t.buyCoffee}
                      </button>

                      {/* App Store (Giữ nguyên tên file ảnh) */}
                      <a href="https://tiendungjxd.my.canva.site/" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group">
                          <img src="/App Store.png" alt="App Store" className="w-8 h-8 object-contain hover:scale-110 transition-transform"/>
                          <span className="text-[10px] sm:text-xs mt-1 font-medium text-slate-400 group-hover:text-white">App Store</span>
                      </a>

                      {/* Các Icon MXH (Giữ nguyên tên file ảnh) */}
                      <a href="https://drive.google.com/file/d/1tvN5fsdJAUSX_Cl820yoceM6gTEEMvAG/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group">
                          <img src="/Zalo.png" alt="Zalo" className="w-8 h-8 object-contain hover:scale-110 transition-transform"/>
                          <span className="text-[10px] sm:text-xs mt-1 font-medium text-slate-400 group-hover:text-white">Zalo</span>
                      </a>
                      <a href="https://www.youtube.com/channel/UCFhWGw9eTCgp2bmbuimkurg" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group">
                          <img src="/Youtube.png" alt="YouTube" className="w-8 h-8 object-contain hover:scale-110 transition-transform"/>
                          <span className="text-[10px] sm:text-xs mt-1 font-medium text-slate-400 group-hover:text-white">YouTube</span>
                      </a>
                      <a href="https://www.tiktok.com/@chuyendramagiadinh" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group">
                           <img src="/Tiktok.png" alt="TikTok" className="w-8 h-8 object-contain hover:scale-110 transition-transform"/>
                           <span className="text-[10px] sm:text-xs mt-1 font-medium text-slate-400 group-hover:text-white">TikTok</span>
                      </a>
                      <a href="https://www.facebook.com/ToolsElevenlabsPro" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group">
                           <img src="/Facebook.png" alt="Facebook" className="w-8 h-8 object-contain hover:scale-110 transition-transform"/>
                           <span className="text-[10px] sm:text-xs mt-1 font-medium text-slate-400 group-hover:text-white">Facebook</span>
                      </a>
                  </div>
              </div>
          </div>
      </nav>
      
      {/* API Key Input */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-slate-700 bg-slate-800/50">
        <label htmlFor="api-key-input" className="block text-sm font-medium text-yellow-400 mb-2">{t.apiKeyLabel}</label>
        <div className="flex">
          <input id="api-key-input" type="password" placeholder="API Key..." className="flex-grow bg-slate-700 border border-slate-600 rounded-l-md p-2 text-sm text-slate-200 focus:ring-1 focus:ring-yellow-500" value={apiKey} onChange={(e) => setApiKey(e.target.value)}/>
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 px-4 py-2 bg-yellow-600 text-slate-900 text-sm font-semibold hover:bg-yellow-700 transition-colors flex items-center">{t.getKey}</a>
          <button type="button" onClick={handleSaveKey} className="flex-shrink-0 px-4 py-2 bg-green-600 text-white text-sm font-semibold hover:bg-green-700">{t.save}</button>
          <button type="button" onClick={handleClearKey} className="flex-shrink-0 px-4 py-2 bg-red-600 text-white rounded-r-md text-sm font-semibold hover:bg-red-700">{t.delete}</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: activeTab === 'scriptGenerator' ? 'block' : 'none' }}>
        {/* TRUYỀN LANG & CALLBACK VÀO ĐÂY */}
        <ScriptGenerator apiKey={apiKey} lang={lang} onAllFinished={handleGenerationFinished} />
      </div>
      <div style={{ display: activeTab === 'watermarkRemover' ? 'block' : 'none' }}>
        {/* TRUYỀN API KEY & LANG VÀO ĐÂY */}
        <WatermarkRemover apiKey={apiKey} lang={lang} />
      </div>

    </div>
  );
};

export default App;