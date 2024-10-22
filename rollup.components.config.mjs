import path from 'path';
import crypto from 'crypto';
import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import nodeExternals from 'rollup-plugin-node-externals';
import esbuild from 'rollup-plugin-esbuild';
import dts from 'rollup-plugin-dts';
import svgr from '@svgr/rollup';

const md5 = str => crypto.createHash('md5').update(str).digest('hex');

const customResolver = resolve({
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
});

const aliasConfig = {
  entries: [
    { find: /^components/, replacement: path.resolve('./src/components') },
    { find: /^hooks/, replacement: path.resolve('./src/hooks') },
    { find: /^lib/, replacement: path.resolve('./src/lib') },
    { find: /^store/, replacement: path.resolve('./src/store') },
    { find: /^public/, replacement: path.resolve('./public') },
    { find: /^assets/, replacement: path.resolve('./src/assets') },
  ],
  customResolver,
};

const jsBundle = {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true,
    },
  ],
  plugins: [
    del({ targets: 'dist/*', runOnce: true }),
    copy({ targets: [{ src: './package.components.json', dest: 'dist', rename: 'package.json' }] }),
    postcss({
      config: false,
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
    nodeExternals(),
    json(),
    alias(aliasConfig),
    esbuild({
      target: 'es6',
      jsx: 'automatic',
      loaders: {
        '.js': 'jsx',
      },
    }),
  ],
};

const dtsBundle = {
  input: 'src/index.ts',
  output: {
    file: 'dist/index.d.ts',
    format: 'es',
  },
  plugins: [alias(aliasConfig), nodeExternals(), json(), dts()],
  external: [/\.css/],
};

export default [jsBundle, dtsBundle];
