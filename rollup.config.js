import clear from 'rollup-plugin-clear';
import commonjs from '@rollup/plugin-commonjs';
import inject from '@rollup/plugin-inject';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

function defaultPlugins(file, options = {}) {
  return [
    clear({
      targets: [file],
      watch: true
    }),
    resolve({
      browser: options.browser || false
    }),
    commonjs(),
    typescript({
      typescript: require('typescript')
    })
  ]
}

export default [
  {
    input: 'src/index.ts',
    output: {
      file: 'lib/index.mjs',
      format: 'esm'
    },
    plugins: defaultPlugins('lib/index.mjs')
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'lib/doofinder.js',
      format: 'iife',
      name: 'doofinder'
    },
    plugins: defaultPlugins('lib/doofinder.js', { browser: true })
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'lib/index.js',
      format: 'cjs'
    },
    external: [
      'node-fetch',
    ],
    plugins: defaultPlugins('lib/index.js').concat([
      inject({
        exclude: 'node_modules/**',
        modules: {
          fetch: 'node-fetch'
        }
      })
    ])
  }
]
