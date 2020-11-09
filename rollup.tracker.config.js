import 'dotenv/config';
import babel, { getBabelOutputPlugin } from '@rollup/plugin-babel';
import buble from '@rollup/plugin-buble';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'tracker/index.js',
  output: {
    file: 'public/umami.js',
    format: 'cjs',
    plugins: [
      getBabelOutputPlugin({
        presets: ['@babel/preset-env'],
        plugins: [['@babel/plugin-transform-runtime', { useESModules: true }]],
      }),
    ],
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      presets: ['@babel/preset-env'],
    }),

    buble({ objectAssign: true, target: { ie: 9 } }),
    terser({ compress: { evaluate: false } }),
  ],
};
