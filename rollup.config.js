import clear from 'rollup-plugin-clear';
import inject from 'rollup-plugin-inject';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

function defaultPlugins(file) {
  return [
    clear({
      targets: [file],
      watch: true
    }),
    resolve({
      dedupe: ['qss']
    }),
    typescript()
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
      file: 'lib/index.js',
      format: 'cjs'
    },
    external: [
      'node-fetch',
      'qs'
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
