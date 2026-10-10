import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts', cli: 'src/cli.ts' },
  format: ['esm', 'cjs'],
  outDir: 'dist',
  dts: { entry: { index: 'src/index.ts' } },
  sourcemap: true,
  clean: true,
  splitting: false,
  target: 'es2022',
  banner: ({ format }) => (format === 'esm' ? {} : {}),
});
