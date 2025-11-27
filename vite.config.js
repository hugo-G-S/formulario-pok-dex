import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // Corregido: "react" completo

export default defineConfig({
  plugins: [react()],
  base: '/formulario-pok-dex/', // ¡AGREGA ESTA LÍNEA!
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost/formulario', 
        changeOrigin: true,
      }
    }
  }
})
