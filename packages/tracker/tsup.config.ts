import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm'],
  outDir: 'dist',
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
});
