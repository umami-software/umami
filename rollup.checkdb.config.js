import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from '@rollup/plugin-node-resolve';
export default {
  input: 'scripts/check-db.js',
  output: {
    file: 'scripts/check-db-bundle.js',
    format: 'cjs',
  },
  plugins: [commonjs(),nodeResolve()],
};
