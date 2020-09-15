import 'dotenv/config';
import buble from '@rollup/plugin-buble';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'tracker/snippet.js',
  output: {
    file: 'public/snippet.js',
    format: 'iife',
  },
  plugins: [
    replace({ __DNT__: !!process.env.ENABLE_DNT }),
    resolve(),
    buble(),
    terser({ compress: { evaluate: false } }),
  ],
};
