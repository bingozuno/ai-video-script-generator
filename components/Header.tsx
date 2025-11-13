import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center p-4 md:p-6 border-b border-slate-700">
      <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
        Chia Cảnh & Tạo Prompt,  Tạo Ảnh Trước Khi Tạo Voice
      </h1>
      <p className="mt-2 text-slate-400 max-w-4xl mx-auto">
        Biến ý tưởng của bạn thành kịch bản video chi tiết với các prompt được tối ưu hóa cho AI tạo hình ảnh và chuyển động.
      </p>
      <p className="mt-4 text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-cyan-400">
        PHÁT TRIỂN BỞI TIẾN DŨNG JXD
      </p>
    </header>
  );
};

export default Header;
