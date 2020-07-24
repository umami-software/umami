import 'dotenv/config';
import buble from '@rollup/plugin-buble';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'tracker/index.js',
  output: {
    file: 'public/umami.js',
    format: 'iife',
  },
  plugins: [nodeResolve(), buble(), terser({ compress: { evaluate: false } })],
};
