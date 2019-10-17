import builtins from 'rollup-plugin-node-builtins';
import clear from 'rollup-plugin-clear';
import commonjs from 'rollup-plugin-commonjs';
import globals from 'rollup-plugin-node-globals';
import inject from 'rollup-plugin-inject';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'lib/index.mjs',
      format: 'esm'
    },
    plugins: [
      clear({
        targets: ['lib/index.mjs'],
        watch: true
      }),
      resolve({
        dedupe: ['qs'],
        preferBuiltins: true
      }),
      commonjs({
        include: 'node_modules/**'
      }),
      typescript()
    ]
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'lib/index.js',
      format: 'cjs'
    },
    external: [
      'node-fetch',
      'qs'
    ],
    plugins: [
      clear({
        targets: ['lib/index.js'],
        watch: true
      }),
      resolve({
        dedupe: ['qs'],
        preferBuiltins: true
      }),
      commonjs({
        include: 'node_modules/**'
      }),
      typescript(),
      globals(),
      builtins(),
      inject({
        exclude: 'node_modules/**',
        modules: {
          fetch: 'node-fetch'
        }
      })
    ]
  }
]
