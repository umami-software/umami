import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL ? env('DATABASE_URL') : env('POSTGRES_PRISMA_URL'),
    directUrl: process.env.DIRECT_DATABASE_URL ? env('DIRECT_DATABASE_URL') : env('POSTGRES_URL_NON_POOLING'),
  },
});
