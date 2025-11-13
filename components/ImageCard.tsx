
import React, { useState } from 'react';
import type { ImageFile } from '../WatermarkRemover'; // Adjusted import path
import { ProcessStatus } from '../WatermarkRemover'; // Adjusted import path

// =================================================================================
// ICONS
// =================================================================================

const TrashIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
);

const DownloadIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
);

const ReprocessIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
    </svg>
);


// =================================================================================
// COMPONENTS
// =================================================================================

const StatusBadge: React.FC<{ status: ProcessStatus }> = ({ status }) => {
  const baseClasses = 'absolute top-3 left-3 text-xs font-bold uppercase px-2 py-1 rounded-full shadow-lg z-10';
  switch (status) {
    case ProcessStatus.Pending:
      return <span className={`${baseClasses} bg-yellow-500 text-slate-900`}>Đang chờ</span>;
    case ProcessStatus.Processing:
      return <span className={`${baseClasses} bg-blue-500 text-white animate-pulse`}>Đang xử lý</span>;
    case ProcessStatus.Completed:
      return <span className={`${baseClasses} bg-green-500 text-white`}>Hoàn thành</span>;
    case ProcessStatus.Error:
      return <span className={`${baseClasses} bg-red-500 text-white`}>Lỗi</span>;
  }
};

interface ImageCardProps {
  imageFile: ImageFile;
  onDelete: (id: string) => void;
  onImageClick: (url: string, name: string) => void;
  onReprocess: (id: string) => void;
  isProcessing: boolean;
}

const ImageCard: React.FC<ImageCardProps> = ({ imageFile, onDelete, onImageClick, onReprocess, isProcessing }) => {
  const [showProcessed, setShowProcessed] = useState(true);
  const { id, file, originalURL, processedURL, status, error } = imageFile;

  const currentImageUrl = showProcessed && processedURL ? processedURL : originalURL;

  const handleDownload = () => {
    if (!processedURL) return;
    
    const originalFilename = file.name;
    const lastDotIndex = originalFilename.lastIndexOf('.');
    const name = lastDotIndex === -1 ? originalFilename : originalFilename.substring(0, lastDotIndex);
    const extension = lastDotIndex === -1 ? '' : originalFilename.substring(lastDotIndex);
    const newFilename = `${name}_delete_Watermark${extension}`;

    const a = document.createElement('a');
    a.href = processedURL;
    a.download = newFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const ImageDisplay = () => (
    <img src={currentImageUrl} alt={file.name} className="w-full h-full object-contain" />
  );

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg transform transition-all hover:scale-[1.02] hover:shadow-2xl flex flex-col">
      <div className="relative aspect-video bg-slate-900 group">
        
        <button
          onClick={() => onImageClick(currentImageUrl, file.name)}
          className="w-full h-full block focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-t-xl"
          aria-label={`Xem ảnh lớn hơn của ${file.name}`}
        >
          <ImageDisplay />
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="ml-2 text-white font-semibold">Xem ảnh</span>
          </div>
        </button>

        <StatusBadge status={status} />
        {status === ProcessStatus.Processing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        <button
            onClick={() => onDelete(id)}
            className="absolute top-3 right-3 bg-red-600/80 hover:bg-red-600 text-white p-2 rounded-full transition-colors backdrop-blur-sm z-10"
            aria-label="Xóa ảnh"
        >
            <TrashIcon />
        </button>
      </div>

      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
            <p className="text-white font-semibold truncate" title={file.name}>{file.name}</p>
            <p className="text-slate-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            {status === ProcessStatus.Error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        <div className="mt-4 space-y-2">
            {status === ProcessStatus.Completed && processedURL && (
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-grow flex rounded-lg bg-slate-700 p-1">
                    <button
                        onClick={() => setShowProcessed(false)}
                        className={`w-1/2 rounded-md py-1 text-sm font-semibold transition-colors ${!showProcessed ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-600'}`}
                    >
                        Trước
                    </button>
                    <button
                        onClick={() => setShowProcessed(true)}
                        className={`w-1/2 rounded-md py-1 text-sm font-semibold transition-colors ${showProcessed ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-600'}`}
                    >
                        Sau
                    </button>
                </div>
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <DownloadIcon />
                </button>
              </div>
            )}
            
            {(status === ProcessStatus.Completed || status === ProcessStatus.Error) && (
              <button
                onClick={() => onReprocess(id)}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white font-bold py-2 px-3 rounded-lg hover:bg-orange-600 disabled:bg-orange-900 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
              >
                <ReprocessIcon />
                Xóa tiếp
              </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
