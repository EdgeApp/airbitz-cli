import buble from 'rollup-plugin-buble'
const packageJson = require('./package.json')

export default {
  banner: '#!/usr/bin/env node',
  entry: 'src/node/index.js',
  external: ['buffer', 'fs', 'path', 'readline'].concat(
    Object.keys(packageJson.dependencies)
  ),
  plugins: [
    buble({
      objectAssign: 'Object.assign',
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
