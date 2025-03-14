import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

const terserOptions = {
  compress: {
    pure_getters: true,
    unsafe: true,
    unsafe_comps: true,
    passes: 3,
    drop_console: true,
    drop_debugger: true,
    pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
    module: true,
    toplevel: true,
    reduce_vars: true,
    reduce_funcs: true,
    keep_fnames: false,
    keep_classnames: false
  },
  mangle: {
    properties: {
      regex: /^_/
    }
  },
  format: {
    comments: false,
    preserve_annotations: false
  }
};

/** @type {import('rollup').RollupOptions} */
export default {
  input: 'dist/temp/index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      interop: 'auto',
      plugins: [terser(terserOptions)]
    },
    {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true,
      exports: 'named',
      plugins: [terser(terserOptions)]
    }
  ],
  external: [
    'lodash.deburr',
    'lodash.every',
    'lodash.get',
    'lodash.isempty',
    'lodash.negate',
    'lodash.orderby',
    'natural',
    'tslib'
  ],
  plugins: [
    nodeResolve({
      extensions: ['.js']
    }),
    commonjs({
      include: 'node_modules/**'
    })
  ]
}; 