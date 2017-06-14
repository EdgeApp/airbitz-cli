import buble from 'rollup-plugin-buble'
const packageJson = require('./package.json')

export default {
  entry: 'src/index.js',
  external: Object.keys(packageJson.dependencies),
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
      dest: packageJson.main,
      format: 'cjs',
      sourceMap: true
    },
    {
      dest: packageJson.module,
      format: 'es',
      sourceMap: true
    }
  ]
}
