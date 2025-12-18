
import React, { useState, useEffect } from 'react';

interface HeaderProps {
  t: any;
  currentLang: 'vi' | 'en';
  onLangChange: (lang: 'vi' | 'en') => void;
  apiKey: string;
  onSaveKey: (key: string) => void;
  onDeleteKey: () => void;
}

const Header: React.FC<HeaderProps> = ({ t, currentLang, onLangChange, apiKey, onSaveKey, onDeleteKey }) => {

  const [localApiKey, setLocalApiKey] = useState(apiKey);

  useEffect(() => {
    setLocalApiKey(apiKey);
  }, [apiKey]);
  
  const handleSaveClick = () => {
    onSaveKey(localApiKey);
  };

  const handleDeleteClick = () => {
    onDeleteKey();
  };

  const handleCoffeeClick = () => {
    const url = 'https://tiendungjxd.my.canva.site/';
    const windowFeatures = 'width=486,height=516,popup=true';
    window.open(url, '_blank', windowFeatures);
  };

  const socialLinks = [
    { name: 'App Store', icon: '/App Store.png', url: 'https://tiendungjxd.my.canva.site/' },
    { name: 'Zalo', icon: '/Zalo.png', url: 'https://drive.google.com/file/d/1tvN5fsdJAUSX_Cl820yoceM6gTEEMvAG/view' },
    { name: 'Youtube', icon: '/Youtube.png', url: 'https://www.youtube.com/channel/UCFhWGw9eTCgp2bmbuimkurg' },
    { name: 'Tiktok', icon: '/Tiktok.png', url: 'https://www.tiktok.com/@tiendungjxd' },
    { name: 'Facebook', icon: '/Facebook.png', url: 'https://www.facebook.com/ToolsElevenlabsPro' },
  ];

  return (
    <header className="text-center p-4 md:p-6 border-b border-slate-800 bg-slate-900/50 overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes coffee-jump {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.1); }
        }
        .coffee-btn:hover .coffee-icon {
          animation: coffee-jump 0.6s ease-in-out infinite;
        }
        .lang-switch-container {
          background-color: #1e293b;
          border: 1px solid #334155;
          padding: 3px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .lang-btn {
          height: 28px;
          padding: 0 10px;
          border-radius: 4px;
          font-weight: 800;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        .lang-btn.active-vn {
          background-color: #dc2626;
          color: white;
        }
        .lang-btn.active-en {
          background-color: #16a34a;
          color: white;
        }
        .lang-btn.inactive {
          color: #94a3b8;
        }
        .coffee-btn {
          background-color: #1a1608;
          border: 1.5px solid #856404;
          color: #facc15;
          border-radius: 9999px;
          padding: 6px 18px;
          font-weight: 700;
          display: flex;
          align-items: center;
          transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        .coffee-btn:hover {
          background-color: #2a240d;
          border-color: #eab308;
          transform: translateY(-1px);
        }
      `}} />

      <div className="flex flex-wrap justify-between items-center w-full mb-8 gap-3">
        {/* API Key Management */}
        <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 p-2 rounded-lg">
          <input
            type="password"
            placeholder={t.api_key_placeholder}
            value={localApiKey}
            onChange={(e) => setLocalApiKey(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-md p-1.5 text-xs text-slate-200 focus:ring-1 focus:ring-cyan-500 w-48"
          />
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            {t.get_api_key}
          </a>
          <button
            onClick={handleSaveClick}
            className="px-2 py-1.5 text-xs font-bold text-slate-900 bg-green-500 rounded-md hover:bg-green-600 transition-colors"
          >
            {t.save_api_key}
          </button>
          <button
            onClick={handleDeleteClick}
            className="px-2 py-1.5 text-xs font-bold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            {t.delete_api_key}
          </button>
        </div>

        {/* Right-aligned group */}
        <div className="flex items-center gap-3">
          {/* VN/EN Switch */}
          <div className="lang-switch-container shadow-lg">
              <button 
                onClick={() => onLangChange('vi')}
                className={`lang-btn ${currentLang === 'vi' ? 'active-vn' : 'inactive'}`}
              >
                VN
              </button>
              <button 
                onClick={() => onLangChange('en')}
                className={`lang-btn ${currentLang === 'en' ? 'active-en' : 'inactive'}`}
              >
                EN
              </button>
          </div>

          {/* Coffee Button */}
          <button 
              onClick={handleCoffeeClick}
              className="coffee-btn group"
          >
              <img 
                src="/coffee-icon.png" 
                alt="Coffee" 
                className="coffee-icon w-6 h-6 mr-2 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://cdn-icons-png.flaticon.com/512/924/924514.png";
                }}
              />
              <span className="text-[14px]">{t.buy_coffee}</span>
          </button>

          {/* Social Icons */}
          <div className="flex items-center space-x-2.5">
              {socialLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-all hover:scale-110 hover:-translate-y-1 block shrink-0"
                  title={link.name}
                >
                  <img 
                    src={link.icon} 
                    alt={link.name} 
                    className="w-9 h-9 object-cover rounded-full shadow-lg border border-slate-700/50 bg-white"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      if (!img.src.includes('placeholder')) {
                        img.src = `https://via.placeholder.com/36/1e293b/cbd5e1?text=${link.name[0]}`;
                      }
                    }}
                  />
                </a>
              ))}
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto no-scrollbar pb-4">
        <h1 className="text-lg md:text-2xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-500 mb-4 tracking-tight whitespace-nowrap px-4">
          {t.app_title}
        </h1>
        <p className="text-slate-400 text-sm md:text-base lg:text-lg mb-6 whitespace-nowrap px-4">
          {t.app_desc}
        </p>
        <div className="inline-block px-6 py-2 rounded-full bg-slate-800/50 border border-slate-700 shadow-xl">
          <p className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 uppercase tracking-widest">
            {t.developed_by}
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
