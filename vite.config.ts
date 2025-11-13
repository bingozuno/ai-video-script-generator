import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url'; // <-- THÊM DÒNG NÀY

// THÊM 2 DÒNG NÀY ĐỂ SỬA LỖI __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          // Bây giờ dòng này sẽ hoạt động chính xác
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});