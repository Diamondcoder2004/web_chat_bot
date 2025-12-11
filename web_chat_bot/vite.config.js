import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  envDir: '.', // Указываем, где искать файлы .env
  server: {
    host: true,
    port: 5173,
    cors: true
  }
})
