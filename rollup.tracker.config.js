import 'dotenv/config';
import buble from '@rollup/plugin-buble';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'tracker/index.js',
  output: {
    file: 'public/umami.js',
    format: 'iife',
  },
  plugins: [resolve(), buble({ objectAssign: true }), terser({ compress: { evaluate: false } })],
};
