import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

<<<<<<< HEAD
// https://vitejs.dev/config/
=======
>>>>>>> f522e51b88c3ba5cdfa13403f987bd6894f5fab0
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
<<<<<<< HEAD
  },
=======
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
>>>>>>> f522e51b88c3ba5cdfa13403f987bd6894f5fab0
})
