import { createRequire } from 'module';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

const require = createRequire(import.meta.url);

function copyMigrationsPlugin() {
  return {
    name: 'copy-migrations',
    closeBundle() {
      const pkgJson = require.resolve('@reyogo/db/package.json');
      const src = resolve(pkgJson, '..', 'migrations');
      const dest = resolve(__dirname, 'out/main/db/migrations');
      copyDir(src, dest);
    },
  };
}

function copyDir(src: string, dest: string): void {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: ['@reyogo/db'] }), copyMigrationsPlugin()],
    resolve: {
      alias: {
        '@reyogo/db': resolve(__dirname, '../../lib/db/src/index.ts'),
        '@main': resolve(__dirname, './src/main'),
        '@shared': resolve(__dirname, './src/shared'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/main.ts'),
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/preload.ts'),
        },
      },
    },
  },
  renderer: {
    root: 'src/renderer',
    plugins: [react()],
    base: './',
    resolve: {
      alias: {
        '@': resolve(__dirname, './src/renderer/src'),
        '@main': resolve(__dirname, './src/main'),
        '@shared': resolve(__dirname, './src/shared'),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
    },
  },
});
