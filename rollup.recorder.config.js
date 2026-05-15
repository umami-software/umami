import 'dotenv/config';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/recorder/index.js',
  output: {
    file: 'public/recorder.js',
    format: 'iife',
  },
  plugins: [
    resolve({ browser: true }),
    commonjs(),
    replace({
      __COLLECT_API_HOST__: process.env.COLLECT_API_HOST || '',
      __COLLECT_REPLAY_ENDPOINT__: process.env.COLLECT_REPLAY_ENDPOINT || '/api/record',
      __RECORDER_CONFIG_ENDPOINT__:
        process.env.RECORDER_CONFIG_ENDPOINT || '/api/websites/{websiteId}/recorder',
      delimiters: ['', ''],
      preventAssignment: true,
    }),
    terser({ compress: { evaluate: false } }),
  ],
};
