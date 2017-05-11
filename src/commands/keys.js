import { command, UsageError } from '../command.js'

command(
  'keys-list',
  {
    help: 'Lists the keys in an account',
    needsAccount: true
  },
  function (console, session, argv) {
    if (argv.length !== 0) throw new UsageError(this)

    console.log(session.account.allKeys)
  }
)
