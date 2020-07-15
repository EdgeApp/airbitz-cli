import babel from '@rollup/plugin-babel'
import typescript from '@rollup/plugin-typescript'

import packageJson from './package.json'

const babelOpts = {
  babelrc: false,
  babelHelpers: 'bundled',
  presets: [
    [
      '@babel/preset-env',
      {
        exclude: ['transform-regenerator'],
        loose: true
      }
    ]
  ],
  plugins: ['transform-fake-error-class']
}

export default [
  // Library:
  {
    external: Object.keys(packageJson.dependencies),
    input: 'src/index.ts',
    output: [
      { file: packageJson.main, format: 'cjs', sourcemap: true },
      { file: packageJson.module, format: 'es', sourcemap: true }
    ],
    plugins: [babel(babelOpts), typescript()]
  },

  // Node.js binary:
  {
    external: [
      'buffer',
      'fs',
      'path',
      'readline',
      ...Object.keys(packageJson.dependencies)
    ],
    input: 'src/node/index.js',
    output: {
      banner: '#!/usr/bin/env node',
      file: packageJson.bin,
      format: 'cjs',
      sourcemap: true
    },
    plugins: [babel(babelOpts), typescript()]
  }
]
