const fs = require('fs');

import clear from 'rollup-plugin-clear';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

export default {
  input: ['src/doofinder.ts'],
  output: [
    {
      file: 'dist/doofinder.min.js',
      format: 'esm',
      name: 'doofinder'
    },
    {
      file: 'dist/doofinder.min.cjs.js',
      format: 'cjs',
      name: 'doofinder'
    },
    {
      file: 'dist/doofinder.min.system.js',
      format: 'system',
      name: 'doofinder'
    }
  ],
  plugins: [
    clear({
      targets: ['dist'],
      watch: true
    }),
    resolve({
      dedupe: [ 'qs' ],
      preferBuiltins: true
    }),
    commonjs({
      include: 'node_modules/**'
    }),
    globals(),
    builtins(),
    typescript(),
    terser()
  ],
}
