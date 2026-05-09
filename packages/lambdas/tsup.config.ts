import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/**/index.ts'],
  outDir: 'dist',
  outExtension: () => ({ js: '.js' }),
  esbuildOptions: (options) => {
    options.outbase = 'src';
  },
  format: ['esm'],
  target: 'node22',
  platform: 'node',
  bundle: true,
  external: ['@aws-sdk/*'],
  sourcemap: true,
  clean: true,
});
