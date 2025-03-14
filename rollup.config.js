import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      interop: 'auto'
    },
    {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true,
      exports: 'named'
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
    nodeResolve(),
    commonjs({
      include: 'node_modules/**'
    }),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: './dist',
      include: ['src/**/*'],
      exclude: ['**/*.test.ts'],
      sourceMap: true
    }),
    terser({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
      }
    })
  ]
}; 