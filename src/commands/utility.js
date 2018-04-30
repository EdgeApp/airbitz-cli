import { internal } from 'edge-core-js'

import { UsageError, command } from '../command.js'

const { authRequest } = internal

command(
  'auth-fetch',
  {
    usage: '[<method>] <path> [<post-body>]',
    help: 'Visits the selected URI on the auth server',
    needsContext: true
  },
  function (console, session, argv) {
    function parseArgs (argv) {
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

    const ai = session.context.internalUnitTestingHack()
    return authRequest(ai, ...parseArgs(argv)).then(reply => console.log(reply))
  }
)
