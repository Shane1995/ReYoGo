import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/handlers/**/index.ts'],
  outDir: 'dist',
  outExtension: () => ({ js: '.js' }),
  esbuildOptions: (options) => {
    options.outbase = 'src/handlers';
  },
  format: ['esm'],
  target: 'node22',
  platform: 'node',
  bundle: true,
  external: ['@aws-sdk/*'],
  sourcemap: true,
  clean: true,
});
