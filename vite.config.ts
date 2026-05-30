import tailwindcss from '@tailwindcss/vite'
import preact from '@preact/preset-vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), preact()],
})
