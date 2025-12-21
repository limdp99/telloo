import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // 포트 사용 중이면 에러 (다른 포트로 안 넘어감)
  },
})
