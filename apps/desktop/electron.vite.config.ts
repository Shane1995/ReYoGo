import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

function copyMigrationsPlugin() {
  return {
    name: 'copy-migrations',
    closeBundle() {
      const src = resolve(__dirname, 'src/main/db/migrations');
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
    plugins: [externalizeDepsPlugin(), copyMigrationsPlugin()],
    resolve: {
      alias: {
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
