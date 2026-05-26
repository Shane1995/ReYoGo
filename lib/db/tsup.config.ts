import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: ['drizzle-orm', '@libsql/client'],
  noExternal: ['@reyogo/types'],
});
