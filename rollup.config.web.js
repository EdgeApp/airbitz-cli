import buble from 'rollup-plugin-buble'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  entry: 'src/web/index.js',
  plugins: [
    buble({
      exclude: 'node_modules/**',
      transforms: {
        dangerousForOf: true
      }
    }),
    commonjs({
      include: /node_modules/
    }),
    nodeResolve({
      browser: true,
      preferBuiltins: false
    })
  ],
  targets: [
    {
      dest: 'assets/airbitz-cli.js',
      format: 'iife',
      moduleName: 'airbitz',
      sourceMap: true
    }
  ]
}
