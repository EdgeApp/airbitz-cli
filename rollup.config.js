import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'

import packageJson from './package.json'

const extensions = ['.ts']
const babelOpts = {
  babelHelpers: 'bundled',
  babelrc: false,
  extensions,
  include: ['src/**/*'],
  presets: [
    [
      '@babel/preset-env',
      {
        exclude: ['transform-regenerator'],
        loose: true
      }
    ],
    '@babel/typescript'
  ],
  plugins: ['transform-fake-error-class']
}
const resolveOpts = { extensions }

function emitCjsPackage() {
  return {
    name: 'emit-cjs-package',
    generateBundle(outputOptions) {
      if (outputOptions.format !== 'cjs') return
      this.emitFile({
        type: 'asset',
        fileName: 'package.json',
        source: JSON.stringify({ type: 'commonjs' })
      })
    }
  }
}

export default [
  // Library:
  {
    external: Object.keys(packageJson.dependencies),
    input: 'src/index.ts',
    output: [
      { file: packageJson.main, format: 'cjs' },
      { file: packageJson.module, format: 'es' }
    ],
    plugins: [babel(babelOpts), emitCjsPackage(), resolve(resolveOpts)]
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
      format: 'cjs'
    },
    plugins: [babel(babelOpts), emitCjsPackage(), resolve(resolveOpts)]
  }
]
