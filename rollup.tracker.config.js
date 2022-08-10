import 'dotenv/config';
import buble from '@rollup/plugin-buble';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'tracker/index.js',
  output: {
    file: 'public/umami.js',
    format: 'iife',
  },
  plugins: [
    replace({
      '/api/collect': process.env.COLLECT_API_ENDPOINT || '/api/collect',
      delimiters: ['', ''],
      preventAssignment: true,
    }),
    buble({ objectAssign: true }),
    terser({ compress: { evaluate: false } }),
  ],
};
