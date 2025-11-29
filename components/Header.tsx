import React from 'react';

interface HeaderProps {
  lang?: 'vi' | 'en';
}

const Header: React.FC<HeaderProps> = ({ lang = 'vi' }) => {
  const t = lang === 'vi' ? {
    title: "Chia Cảnh & Tạo Prompt, Tạo Ảnh Trước Khi Tạo Voice",
    subtitle: "Biến ý tưởng của bạn thành kịch bản video chi tiết với các prompt được tối ưu hóa cho AI tạo hình ảnh và chuyển động.",
    dev: "PHÁT TRIỂN BỞI TIẾN DŨNG JXD"
  } : {
    title: "Scene Splitting & Prompt Gen, Image Gen Before Voice",
    subtitle: "Turn your ideas into detailed video scripts with optimized prompts for AI image and motion generation.",
    dev: "DEVELOPED BY TIẾN DŨNG JXD"
  };

  return (
    <header className="py-8 text-center space-y-4">
      <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-sm">
        {t.title}
      </h1>
      <p className="text-slate-400 text-sm md:text-base max-w-3xl mx-auto px-4">
        {t.subtitle}
      </p>
      <div className="pt-2">
        <span className="text-green-500 font-bold tracking-widest text-lg uppercase border-b-2 border-green-500/30 pb-1">
          {t.dev}
        </span>
      </div>
    </header>
  );
};

export default Header;