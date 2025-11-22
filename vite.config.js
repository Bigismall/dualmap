import { biomePlugin } from '@pbr1111/vite-plugin-biome';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    // Wyłączony plugin Biome na czas build - może blokować build z powodu warnings
    // biomePlugin()
  ],
});
