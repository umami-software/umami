import path from 'path';
import crypto from 'crypto';
import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import postcss from 'rollup-plugin-postcss';
import del from 'rollup-plugin-delete';
import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';
import svgr from '@svgr/rollup';
import externals from 'rollup-plugin-node-externals';
import json from '@rollup/plugin-json';

const md5 = str => crypto.createHash('md5').update(str).digest('hex');

const aliases = [
  { find: /^components/, replacement: path.resolve('./components') },
  { find: /^hooks/, replacement: path.resolve('./hooks') },
  { find: /^assets/, replacement: path.resolve('./assets') },
  { find: /^lib/, replacement: path.resolve('./lib') },
  { find: /^store/, replacement: path.resolve('./store') },
  { find: /^public/, replacement: path.resolve('./public') },
];

const aliasResolver = resolve({
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
});

const jsBundle = {
  input: 'components/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.mjs',
      format: 'es',
      sourcemap: true,
    },
  ],
  plugins: [
    del({ targets: 'dist/*', runOnce: true }),
    postcss({
      extract: 'styles.css',
      sourceMap: true,
      minimize: true,
      modules: {
        generateScopedName: function (name, filename, css) {
          const file = path.basename(filename, '.css').replace('.module', '');
          const hash = Buffer.from(md5(`${name}:${filename}:${css}`))
            .toString('base64')
            .substring(0, 5);

          return `${file}-${name}--${hash}`;
        },
      },
    }),
    svgr({ icon: true }),
    externals(),
    alias({
      entries: aliases,
      customResolver: aliasResolver,
    }),
    json(),
    esbuild({
      loaders: {
        '.js': 'jsx',
      },
    }),
  ],
};

const dtsBundle = {
  input: 'components/index.ts',
  output: {
    file: 'dist/index.d.ts',
    format: 'es',
  },
  plugins: [
    alias({
      entries: aliases,
      customResolver: aliasResolver,
    }),
    externals(),
    dts(),
  ],
};

export default [jsBundle, dtsBundle];
