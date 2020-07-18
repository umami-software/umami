import 'dotenv/config';
import buble from '@rollup/plugin-buble';
import replace from '@rollup/plugin-replace';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'scripts/umami/index.js',
  output: {
    file: 'public/umami.js',
    format: 'iife',
  },
  plugins: [
    replace({
      'process.env.UMAMI_URL': JSON.stringify(process.env.UMAMI_URL),
    }),
    nodeResolve(),
    buble(),
    terser({ compress: { evaluate: false } }),
  ],
};
