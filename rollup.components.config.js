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

const md5 = str => crypto.createHash('md5').update(str).digest('hex');

const customResolver = resolve({
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
});

const aliasConfig = {
  entries: [
    { find: /^@/, replacement: path.resolve('./src/') },
    { find: /^public/, replacement: path.resolve('./public') },
  ],
  customResolver,
};

const clientConfig = {
  input: 'src/index.client.ts',
  output: [
    {
      file: 'dist/client/index.js',
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
    alias(aliasConfig),
    nodeExternals(),
    json(),
    esbuild({
      target: 'es6',
      jsx: 'automatic',
      loaders: {
        '.js': 'jsx',
      },
    }),
  ],
};

const serverConfig = {
  input: 'src/index.server.ts',
  output: {
    file: 'dist/server/index.ts',
    format: 'es',
  },
  plugins: [alias(aliasConfig), nodeExternals(), json()],
  external: [/\.css/],
};

export default [clientConfig, serverConfig];
