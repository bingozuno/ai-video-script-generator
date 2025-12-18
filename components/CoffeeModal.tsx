
import React from 'react';

interface CoffeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
}

const CoffeeModal: React.FC<CoffeeModalProps> = ({ isOpen, onClose, text }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[70] p-4 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-slate-900 rounded-2xl w-full max-w-[400px] h-[550px] flex flex-col items-center overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-700 relative scale-in-center animate-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 w-full overflow-y-auto p-8 flex flex-col items-center">
          <div className="bg-white p-3 rounded-2xl shadow-inner mb-6">
            <img 
              src="/QR.png" 
              alt="QR Donation" 
              className="w-full max-w-[280px] h-auto object-contain"
              onError={(e) => {
                 (e.target as HTMLImageElement).src = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://tiendungjxd.my.canva.site/';
              }}
            />
          </div>
          <p className="text-slate-200 text-sm md:text-base text-center whitespace-pre-wrap leading-relaxed font-medium">
            {text}
          </p>
        </div>
        
        <div className="p-6 w-full bg-slate-900">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-bold shadow-lg transform active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoffeeModal;
