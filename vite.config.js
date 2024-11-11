import biomePlugin from 'vite-plugin-biome';

export default {
  base: '/dualmap/',
  plugins: [
    biomePlugin({
      mode: 'check',
      files: '.',
      applyFixes: true,
    }),
  ],
};
