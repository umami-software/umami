import 'dotenv/config';
import buble from '@rollup/plugin-buble';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const scriptName = process.env.TRACKER_SCRIPT_NAME || 'umami';

export default {
  input: 'tracker/index.js',
  output: {
    file: `public/${scriptName}.js`,
    format: 'iife',
  },
  plugins: [resolve(), buble({ objectAssign: true }), terser({ compress: { evaluate: false } })],
};
