import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/main/db/drizzle/schema.ts',
  out: './src/main/db/migrations',
  dbCredentials: {
    url: './.data/dev.db',
  },
});
