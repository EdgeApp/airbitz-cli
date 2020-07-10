import hashjs from 'hash.js'
import { base64 } from 'rfc4648'

import { command, UsageError } from '../command.js'
import { base58, utf8 } from '../util/encoding.js'
import { getInternalStuff } from '../util/internal.js'

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
    const internal = getInternalStuff(session.context)
    switch (argv.length) {
      case 1:
        return internal
          .authRequest('GET', argv[0], {})
          .then(reply => console.log(reply))
      case 2:
        return internal
          .authRequest('POST', argv[0], JSON.parse(argv[1]))
          .then(reply => console.log(reply))
      case 3:
        return internal
          .authRequest(argv[0], argv[1], JSON.parse(argv[2]))
          .then(reply => console.log(reply))
      default:
        throw new UsageError(this)
    }
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
