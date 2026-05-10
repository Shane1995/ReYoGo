import react from '@vitejs/plugin-react';
import { defineConfig, mergeConfig, type UserConfig } from 'vite';

const base: UserConfig = {
  plugins: [...react()],
};

export function createViteConfig(overrides: UserConfig = {}): UserConfig {
  return mergeConfig(defineConfig(base), defineConfig(overrides));
}
