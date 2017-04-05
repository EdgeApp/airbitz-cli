import buble from 'rollup-plugin-buble'
const packageJson = require('./package.json')

export default {
  banner: '#!/usr/bin/env node',
  entry: 'src/node/index.js',
  external: Object.keys(packageJson.dependencies),
  plugins: [
    buble({
      transforms: {
        dangerousForOf: true
      }
    })
  ],
  targets: [
    {
      dest: packageJson.bin,
      format: 'cjs',
      sourceMap: true
    }
  ]
}
