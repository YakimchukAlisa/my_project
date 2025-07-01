import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,  // Можно изменить, если порт занят
    open: true    // Автоматически открывать браузер
  }
})