import 'dotenv/config';
import hashbang from 'rollup-plugin-hashbang';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'cli/index.js',
  output: {
    file: 'cli.js',
    format: 'cjs',
  },
  plugins: [
    hashbang(),
    commonjs({
      include: 'node_modules/**',
    }),
  ],
  external: ['yargs', 'chalk', 'dotenv/config', '@prisma/client'],
};
