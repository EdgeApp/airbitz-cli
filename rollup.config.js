import babel from 'rollup-plugin-babel'

import packageJson from './package.json'

const babelOpts = {
  babelrc: false,
  presets: [
    [
      '@babel/preset-env',
      {
        exclude: ['transform-regenerator'],
        loose: true
      }
    ]
  ]
}

export default [
  // Library:
  {
    external: Object.keys(packageJson.dependencies),
    input: 'src/index.js',
    output: [
      { file: packageJson.main, format: 'cjs', sourcemap: true },
      { file: packageJson.module, format: 'es', sourcemap: true }
    ],
    plugins: [babel(babelOpts)]
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
    plugins: [babel(babelOpts)]
  }
]
