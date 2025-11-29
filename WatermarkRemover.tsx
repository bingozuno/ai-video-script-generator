import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import ImageModal from './components/ImageModal';
import ImageCard from './components/ImageCard'; 

// =================================================================================
// TYPES (Giữ nguyên)
// =================================================================================

export enum ProcessStatus {
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed',
  Error = 'error',
}

export enum WatermarkLocation {
  TopLeft = 'top-left',
  TopRight = 'top-right',
  BottomLeft = 'bottom-left',
  BottomRight = 'bottom-right',
  Center = 'center',
}

const WATERMARK_LOCATION_LABELS: Record<WatermarkLocation, string> = {
  [WatermarkLocation.TopLeft]: 'Trên-Trái',
  [WatermarkLocation.TopRight]: 'Trên-Phải',
  [WatermarkLocation.BottomLeft]: 'Dưới-Trái',
  [WatermarkLocation.BottomRight]: 'Dưới-Phải',
  [WatermarkLocation.Center]: 'Giữa',
};


export interface ImageFile {
  id: string;
  file: File;
  originalURL: string;
  processedURL?: string;
  status: ProcessStatus;
  error?: string;
}

// =================================================================================
// GEMINI SERVICE (Giữ nguyên logic)
// =================================================================================

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove 'data:image/jpeg;base64,' part
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const removeWatermark = async (
  file: File,
  locations: WatermarkLocation[],
  apiKey: string 
): Promise<string> => {
    
    if (!apiKey) {
        throw new Error("Vui lòng nhập Gemini API Key của bạn ở đầu trang.");
    }
    
    const ai = new GoogleGenAI({ apiKey });

    const base64Data = await fileToBase64(file);

    const locationHint = locations.length > 0
      ? ` Gợi ý: Watermark có thể ở ${locations.map(l => WATERMARK_LOCATION_LABELS[l]).join(', ')}.`
      : '';
    const promptText = `Xóa hoàn toàn mọi watermark, logo, và chữ viết khỏi ảnh này. Hãy lấp đầy vùng trống một cách tự nhiên để ảnh trông liền mạch.${locationHint}`;

    const MAX_RETRIES = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image', // Hoặc gemini-2.0-flash-exp
                contents: {
                    parts: [
                        {
                            inlineData: {
                                data: base64Data,
                                mimeType: file.type,
                            },
                        },
                        {
                            text: promptText,
                        },
                    ],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });
            
            for (const part of response.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                    return part.inlineData.data; // Success
                }
            }
            throw new Error("Không nhận được dữ liệu hình ảnh từ API.");

        } catch (error) {
            lastError = error as Error;
            console.warn(`Attempt ${attempt} for ${file.name} failed:`, error);
            if (attempt < MAX_RETRIES) {
                const delay = Math.pow(2, attempt) * 200; // 400ms, 800ms
                await sleep(delay);
            }
        }
    }
    
    console.error(`All ${MAX_RETRIES} attempts failed for ${file.name}. Last error:`, lastError);
    throw new Error(`Không thể xử lý hình ảnh bằng AI. Lỗi cuối: ${lastError?.message || 'Không xác định'}`);
};


// =================================================================================
// COMPONENTS (Giữ nguyên)
// =================================================================================

// --- Dropzone Component ---
const UploadIcon = () => (
    <svg className="w-12 h-12 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
);

interface DropzoneProps {
  onFilesAdded: (files: File[]) => void;
  maxFiles: number;
  currentFileCount: number;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFilesAdded, maxFiles, currentFileCount }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const acceptedFiles = Array.from(e.dataTransfer.files).filter((file: File) => file.type.startsWith('image/'));
      onFilesAdded(acceptedFiles);
    }
  }, [onFilesAdded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const acceptedFiles = Array.from(e.target.files).filter((file: File) => file.type.startsWith('image/'));
      onFilesAdded(acceptedFiles);
    }
  };

  const remainingSlots = maxFiles - currentFileCount;

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`relative w-full p-8 border-2 border-dashed rounded-xl transition-colors duration-300 ${isDragActive ? 'border-indigo-500 bg-slate-800' : 'border-slate-600 bg-slate-900/50'}`}
    >
      <input
        type="file"
        id="file-upload"
        multiple
        accept="image/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleChange}
        disabled={remainingSlots <= 0}
      />
      <label htmlFor="file-upload" className="flex flex-col items-center justify-center text-center cursor-pointer">
        <UploadIcon/>
        <p className="mt-4 text-lg font-semibold text-white">Kéo & thả tệp vào đây, hoặc nhấn để chọn</p>
        <p className="mt-1 text-sm text-slate-400">
          Hỗ trợ: JPG, PNG, WEBP, GIF
        </p>
        <p className={`mt-2 font-semibold text-sm ${remainingSlots > 0 ? 'text-indigo-400' : 'text-red-500'}`}>
          {remainingSlots > 0 ? `Còn lại ${remainingSlots} chỗ` : 'Hàng đợi đã đầy'}
        </p>
      </label>
    </div>
  );
};


// --- Controls Component ---
const CheckboxIcon = ({ checked }: { checked: boolean }) => (
    <svg className="w-5 h-5 mr-2 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="6" fill={checked ? "#4f46e5" : "#475569"} />
        {checked && <path d="M7 12.5L10.5 16L17 9.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
);

interface ControlsProps {
  locations: Set<WatermarkLocation>;
  onLocationChange: (location: WatermarkLocation, checked: boolean) => void;
  onProcessClick: () => void;
  onDownloadAllClick: () => void;
  onClearAllClick: () => void;
  isProcessing: boolean;
  pendingFilesCount: number;
  completedFilesCount: number;
  totalFilesCount: number;
}

const Controls: React.FC<ControlsProps> = ({
  locations,
  onLocationChange,
  onProcessClick,
  onDownloadAllClick,
  onClearAllClick,
  isProcessing,
  pendingFilesCount,
  completedFilesCount,
  totalFilesCount,
}) => {
  const allLocations = Object.values(WatermarkLocation);

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">1. Chọn vị trí Watermark (Tùy chọn)</h3>
          <p className="text-sm text-slate-400 mb-4">Chọn vị trí của watermark để có kết quả tốt hơn.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {allLocations.map((loc) => (
              <label key={loc} className="flex items-center cursor-pointer text-slate-200 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  className="hidden"
                  checked={locations.has(loc)}
                  onChange={(e) => onLocationChange(loc, e.target.checked)}
                />
                <CheckboxIcon checked={locations.has(loc)} />
                {WATERMARK_LOCATION_LABELS[loc]}
              </label>
            ))}
          </div>
        </div>
        <div className="border-t border-slate-700 md:border-t-0 md:border-l md:pl-6">
          <h3 className="text-lg font-semibold text-white mb-3">2. Xử lý & Tải xuống</h3>
          <p className="text-sm text-slate-400 mb-4">Bắt đầu xử lý, tải xuống các ảnh đã hoàn thành hoặc xóa toàn bộ.</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onProcessClick}
              disabled={isProcessing || pendingFilesCount === 0}
              className="flex-grow bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-900 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              {isProcessing ? 'Đang xử lý...' : `Xóa Watermark (${pendingFilesCount})`}
            </button>
            <button
              onClick={onDownloadAllClick}
              disabled={isProcessing || completedFilesCount === 0}
              className="flex-grow bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-900 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            >
              Tải xuống tất cả ({completedFilesCount})
            </button>
            <button
              onClick={onClearAllClick}
              disabled={isProcessing || totalFilesCount === 0}
              className="flex-grow bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-red-900 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Xóa tất cả ({totalFilesCount})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// =================================================================================
// MAIN APP COMPONENT (Đã sửa để nhận apiKey và lang)
// =================================================================================

const MAX_FILES = 50;
const CONCURRENCY_LIMIT = 5;

// SỬA LỖI: Thêm `apiKey` và `lang` vào props
interface WatermarkRemoverProps {
  apiKey: string;
  lang: 'vi' | 'en'; // Nhận thêm ngôn ngữ
}

// SỬA LỖI: Nhận `{ apiKey, lang }` từ props
const WatermarkRemover: React.FC<WatermarkRemoverProps> = ({ apiKey, lang }) => {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [watermarkLocations, setWatermarkLocations] = useState<Set<WatermarkLocation>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalImage, setModalImage] = useState<{src: string, name: string} | null>(null);

  const processFiles = useCallback(async () => {
    const pendingFiles = files.filter(f => f.status === ProcessStatus.Pending);

    if (pendingFiles.length === 0) {
        return;
    }

    // SỬA LỖI: Kiểm tra apiKey trước khi chạy
    if (!apiKey) {
      alert("Vui lòng nhập Gemini API Key của bạn ở đầu trang để xử lý ảnh.");
      return;
    }

    setIsProcessing(true);
    try {
        const locations = [...watermarkLocations];

        const processImageAndUpdateState = async (imageFile: ImageFile) => {
            setFiles(prev => prev.map(f => f.id === imageFile.id ? { ...f, status: ProcessStatus.Processing } : f));
            try {
                // SỬA LỖI: Truyền `apiKey` vào hàm
                const resultBase64 = await removeWatermark(imageFile.file, locations, apiKey);
                const processedURL = `data:image/png;base64,${resultBase64}`;
                setFiles(prev => prev.map(f => f.id === imageFile.id ? { ...f, status: ProcessStatus.Completed, processedURL } : f));
            } catch (err) {
                const error = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.';
                setFiles(prev => prev.map(f => f.id === imageFile.id ? { ...f, status: ProcessStatus.Error, error } : f));
            }
        };

        for (let i = 0; i < pendingFiles.length; i += CONCURRENCY_LIMIT) {
            const chunk = pendingFiles.slice(i, i + CONCURRENCY_LIMIT);
            await Promise.all(chunk.map(file => processImageAndUpdateState(file)));
        }
    } finally {
        setIsProcessing(false);
    }
  }, [files, watermarkLocations, apiKey]); 

  const handleReprocessImage = useCallback(async (id: string) => {
    const imageFileToReprocess = files.find(f => f.id === id);
    if (!imageFileToReprocess) return;

    if (!apiKey) {
      alert("Vui lòng nhập Gemini API Key của bạn ở đầu trang để xử lý ảnh.");
      return;
    }

    setFiles(prev => prev.map(f => f.id === id ? { 
        ...f, 
        status: ProcessStatus.Processing,
        error: undefined 
    } : f));

    try {
        const locations = [...watermarkLocations];
        const resultBase64 = await removeWatermark(imageFileToReprocess.file, locations, apiKey);
        const processedURL = `data:image/png;base64,${resultBase64}`;
        
        setFiles(prev => prev.map(f => f.id === id ? { 
            ...f, 
            status: ProcessStatus.Completed, 
            processedURL 
        } : f));
    } catch (err) {
        const error = err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định.';
        setFiles(prev => prev.map(f => f.id === id ? { 
            ...f, 
            status: ProcessStatus.Error, 
            error 
        } : f));
    }
  }, [files, watermarkLocations, apiKey]);

  useEffect(() => {
    return () => {
      files.forEach(f => {
        URL.revokeObjectURL(f.originalURL);
      });
    };
  }, [files]);

  const addFiles = useCallback((newFiles: File[]) => {
    const filesToAdd = newFiles.slice(0, MAX_FILES - files.length);
    const imageFileObjects: ImageFile[] = filesToAdd.map(file => ({
      id: crypto.randomUUID(),
      file,
      originalURL: URL.createObjectURL(file),
      status: ProcessStatus.Pending,
    }));
    setFiles(prev => [...prev, ...imageFileObjects]);
  }, [files.length]);

  const deleteFile = useCallback((id: string) => {
    setFiles(prev => {
      const fileToDelete = prev.find(f => f.id === id);
      if (fileToDelete) {
        URL.revokeObjectURL(fileToDelete.originalURL);
      }
      return prev.filter(f => f.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    files.forEach(f => {
      URL.revokeObjectURL(f.originalURL);
    });
    setFiles([]);
  }, [files]);
  
  const handleLocationChange = (location: WatermarkLocation, checked: boolean) => {
    setWatermarkLocations(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(location);
      } else {
        newSet.delete(location);
      }
      return newSet;
    });
  };

  const handleOpenImageModal = (src: string, name: string) => {
    setModalImage({ src, name });
  };

  const handleCloseImageModal = () => {
    setModalImage(null);
  };
  
  const downloadAll = () => {
    files.forEach(f => {
      if (f.status === ProcessStatus.Completed && f.processedURL) {
        const originalFilename = f.file.name;
        const lastDotIndex = originalFilename.lastIndexOf('.');
        const name = lastDotIndex === -1 ? originalFilename : originalFilename.substring(0, lastDotIndex);
        const extension = lastDotIndex === -1 ? '' : originalFilename.substring(lastDotIndex);
        const newFilename = `${name}_delete_Watermark${extension}`;

        const a = document.createElement('a');
        a.href = f.processedURL;
        a.download = newFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    });
  };

  const completedFilesCount = files.filter(f => f.status === ProcessStatus.Completed).length;
  const pendingFilesCount = files.filter(f => f.status === ProcessStatus.Pending).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            {lang === 'vi' ? 'AI Xóa Watermark' : 'AI Watermark Remover'}
          </h1>
          <p className="mt-2 text-lg text-slate-300">
            {lang === 'vi' ? 'Xóa hàng loạt watermark khỏi ảnh của bạn.' : 'Bulk remove watermarks from your images.'}
          </p>
        </header>

        <main>
          <Controls 
            locations={watermarkLocations}
            onLocationChange={handleLocationChange}
            onProcessClick={processFiles}
            onDownloadAllClick={downloadAll}
            onClearAllClick={clearAll}
            isProcessing={isProcessing}
            pendingFilesCount={pendingFilesCount}
            completedFilesCount={completedFilesCount}
            totalFilesCount={files.length}
          />
          
          {files.length === 0 && (
            <Dropzone onFilesAdded={addFiles} maxFiles={MAX_FILES} currentFileCount={files.length} />
          )}
          
          {files.length > 0 && (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {files.map(imageFile => (
                    <ImageCard 
                        key={imageFile.id} 
                        imageFile={imageFile} 
                        onDelete={deleteFile}
                        onImageClick={handleOpenImageModal}
                        onReprocess={handleReprocessImage}
                        isProcessing={isProcessing}
                    />
                ))}
                 {files.length < MAX_FILES && (
                    <div className="flex items-center justify-center min-h-[250px] sm:min-h-0">
                         <Dropzone onFilesAdded={addFiles} maxFiles={MAX_FILES} currentFileCount={files.length} />
                    </div>
                )}
            </div>
            </>
          )}

        </main>
      </div>
      <ImageModal 
        isOpen={!!modalImage}
        onClose={handleCloseImageModal}
        imageUrl={modalImage?.src || null}
        imageName={modalImage?.name || null}
      />
    </div>
  );
};

export default WatermarkRemover;