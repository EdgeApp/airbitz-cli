import { command, UsageError } from '../command.js'
import { makeFakeContexts } from '../../'
import { base16, base64 } from '../../util/encoding.js'
import { sha256 } from '../../crypto/crypto.js'

command(
  'temp',
  {
    needsContext: false
  },
  function (session, argv) {
    if (argv.length) throw new UsageError(this)
    const [context] = makeFakeContexts(1)
    const seed = context.io.random(32)

    console.log(base16.stringify(seed))
    console.log(base16.stringify(sha256(sha256(seed))))

    console.log(base64.stringify(seed))
    console.log(base64.stringify(sha256(sha256(seed))))
  }
)
