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
      '/api/collect': process.env.API_COLLECT_ENDPOINT
        ? process.env.API_COLLECT_ENDPOINT
        : '/api/collect',
      delimiters: ['', ''],
    }),
    buble({ objectAssign: true }),
    terser({ compress: { evaluate: false } }),
  ],
};
