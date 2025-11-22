import { biomePlugin } from '@pbr1111/vite-plugin-biome';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    
     biomePlugin({
      errorOnWarnings: false,
      mode: 'check',
      paths: ['./src/**/*.{ts,tsx}'],
      failOnError: false,
      verbose: true,

     })
  ],
});
