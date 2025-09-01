import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { index: 'src/index.client.ts' },
    format: ['esm'],
    outDir: 'dist/client',
    dts: true,
    splitting: false,
    sourcemap: false,
    clean: true,
    external: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  {
    entry: { index: 'src/index.server.ts' },
    format: ['esm'],
    outDir: 'dist/server',
    dts: true,
    splitting: false,
    sourcemap: false,
    clean: true,
  },
]);
