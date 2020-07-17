import 'dotenv/config';
import { terser } from 'rollup-plugin-terser';
import replace from 'rollup-plugin-replace';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'scripts/umami/index.js',
  output: {
    file: 'public/umami.js',
    format: 'iife',
    globals: {
      'detect-browser': 'detectBrowser',
      'whatwg-fetch': 'fetch',
    },
    plugins: [terser()],
  },
  context: 'window',
  plugins: [
    nodeResolve(),
    replace({
      'process.env.UMAMI_URL': JSON.stringify(process.env.UMAMI_URL),
    }),
  ],
};
