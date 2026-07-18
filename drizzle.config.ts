import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/data/database/schema.ts',
  out: './src/data/database/generated',
});
