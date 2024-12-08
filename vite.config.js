import { resolve } from 'path';
import biomePlugin from 'vite-plugin-biome';

export default {
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        osmbuildings: resolve(__dirname, '/osmbuildings/index.html'),
      },
    },
  },

  base: '/dualmap/',

  plugins: [biomePlugin()],
};
