import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
  },
  env: {
    umami_user: 'admin',
    umami_password: 'pennydoodoo',
  },
});
