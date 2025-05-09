import 'dotenv/config';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/tracker/index.js',
  output: {
    file: 'public/script.js',
    format: 'iife',
  },
  plugins: [
    replace({
      '__COLLECT_API_HOST__': process.env.COLLECT_API_HOST || '',
      '__COLLECT_API_ENDPOINT__': process.env.COLLECT_API_ENDPOINT || '/api/send',
      delimiters: ['', ''],
      preventAssignment: true,
    }),
    terser({ compress: { evaluate: false } }),
  ],
};
