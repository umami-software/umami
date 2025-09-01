import esbuild from 'esbuild';
import { commonjs } from '@hyrious/esbuild-plugin-commonjs';
import fs from 'node:fs';

fs.copyFileSync('./package.components.json', './dist/package.json');

esbuild
  .build({
    entryPoints: ['src/index.client.ts'],
    outfile: 'dist/client/index.js',
    platform: 'browser',
    bundle: true,
    jsx: 'automatic',
    format: 'esm',
    plugins: [commonjs()],
    external: ['react', 'react-dom', 'react-jsx/runtime', '@swc/helpers'],
  })
  .catch(e => {
    // eslint-disable-next-line
    console.error(e);
    process.exit(1);
  });

esbuild
  .build({
    entryPoints: ['src/index.server.ts'],
    outfile: 'dist/server/index.js',
    platform: 'node',
    bundle: true,
    format: 'esm',
  })
  .catch(e => {
    // eslint-disable-next-line
    console.error(e);
    process.exit(1);
  });
