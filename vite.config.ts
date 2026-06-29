import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_BASE_URL || 'http://10.10.7.28:5000'
  /** Static files may be served by nginx while API runs on :5000 */
  const uploadsProxyTarget = env.VITE_UPLOADS_PROXY_TARGET || apiTarget

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
      port: 4175,
      open: false,
      strictPort: true,
      allowedHosts: [
        '46.202.176.52',
        "10.10.7.30",
      ],
      proxy: {
        '/uploads': {
          target: uploadsProxyTarget,
          changeOrigin: true,
          secure: false,
        },
        '/image': {
          target: uploadsProxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    preview: {
      host: true,
      open: false,
      port: 4175,
      proxy: {
        '/uploads': {
          target: uploadsProxyTarget,
          changeOrigin: true,
          secure: false,
        },
        '/image': {
          target: uploadsProxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
      allowedHosts: [
        '46.202.176.52',
        "10.10.7.30",
        'localhost',
      ],
    },
  }
})

