import { defineConfig } from '@eloqnt/cli';

export default defineConfig({
  srcPath: './src',
  messages: {
    path: './public/intl/messages',
    locales: 'infer',
    sourceLocale: 'en-US',
    format: 'json',
  },
  lint: {
    rules: {
      // Keys are looked up via the `labels`/`messages` maps in
      // `src/components/messages.ts`, so no call site is statically analyzable
      'orphan-message': 'off',
    },
  },
});
