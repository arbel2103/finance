import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// בנייה ל-GitHub Pages תחת /finance/ ; בפיתוח מקומי מהשורש /
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/finance/' : '/',
}))
