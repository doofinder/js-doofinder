import clear from 'rollup-plugin-clear';
import commonjs from '@rollup/plugin-commonjs';
import inject from '@rollup/plugin-inject';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

function defaultPlugins(file, options = {}) {
  const plugins = [
    clear({
      targets: [file],
      watch: true,
    }),
    resolve({
      browser: options.browser || false,
    }),
    typescript(),
    commonjs({ extensions: ['.js', '.ts'] }), // the ".ts" extension is required
  ];
  if (options.terser) plugins.push(terser());
  return plugins;
}

export default [
  // ES module
  {
    input: 'src/index.ts',
    output: {
      file: 'lib/index.js',
      format: 'esm',
    },
    plugins: defaultPlugins('lib/index.js'),
  },
  // for browsers, all included
  {
    input: 'src/index.ts',
    output: {
      file: 'browser/doofinder.js',
      format: 'iife',
      name: 'doofinder',
    },
    plugins: defaultPlugins('browser/doofinder.js', { browser: true }),
  },
  // for browsers, all included and minified
  {
    input: 'src/index.ts',
    output: {
      file: 'browser/doofinder.min.js',
      format: 'iife',
      name: 'doofinder',
    },
    plugins: defaultPlugins('browser/doofinder.min.js', { browser: true, terser: true }),
  },
  // Commonjs module for old node (not ES modules)
  {
    input: 'src/index.ts',
    output: {
      file: 'commonjs/index.js',
      format: 'cjs',
    },
    external: ['node-fetch'],
    plugins: defaultPlugins('commonjs/index.js').concat([
      inject({
        exclude: 'node_modules/**',
        modules: {
          fetch: 'node-fetch',
        },
      }),
    ]),
  },
];
