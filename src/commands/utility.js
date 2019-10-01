import hashjs from 'hash.js'
import { base64 } from 'rfc4648'

import { UsageError, command } from '../command.js'
import { base58, utf8 } from '../encoding.js'

function hmacSha256(data, key) {
  const hmac = hashjs.hmac(hashjs.sha256, key)
  return hmac.update(data).digest()
}

command(
  'auth-fetch',
  {
    usage: '[<method>] <path> [<post-body>]',
    help: 'Visits the selected URI on the auth server',
    needsContext: true
  },
  function(console, session, argv) {
    function parseArgs(argv) {
      switch (argv.length) {
        case 1:
          return ['GET', argv[0], {}]
        case 2:
          return ['POST', argv[0], JSON.parse(argv[1])]
        case 3:
          return [argv[0], argv[1], JSON.parse(argv[2])]
        default:
          throw new UsageError(this)
      }
    }

    const internal = session.context.$internalStuff
    return internal
      .authRequest(...parseArgs(argv))
      .then(reply => console.log(reply))
  }
)

command(
  'filename-hash',
  {
    usage: '[dataKey] [txid]',
    help: 'Runs the filename hashing algorithm',
    needsContext: true
  },
  function(console, session, argv) {
    if (argv.length !== 2) throw new UsageError(this)
    const dataKey = argv[0]
    const data = argv[1]

    console.log(
      base58.stringify(hmacSha256(utf8.parse(data), base64.parse(dataKey)))
    )
  }
)
