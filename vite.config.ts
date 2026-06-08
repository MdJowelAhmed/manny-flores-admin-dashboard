import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_BASE_URL || 'http://10.10.7.28:5000'

  return {
    plugins: [react()],
    css: {
      postcss: {
        plugins: [tailwindcss(), autoprefixer()],
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: true,
      
      open: true,
      port: 5175,
      strictPort: true,
      allowedHosts: [
        '193.46.198.251',
        "10.10.7.30",
      ],
      proxy: {
        '/uploads': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
        '/image': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      host: true,
      port: 5175,
      allowedHosts: [
        '193.46.198.251',
        "10.10.7.30",
        'localhost',
      ],
    },
  }
})

