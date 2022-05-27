import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.md', '**/*.svg'],
  build: { target: 'esnext' },
  resolve: {
    alias: [
      { find: '@', replacement: '/src' },
      { find: '+', replacement: '/public' },
    ],
  },
})
