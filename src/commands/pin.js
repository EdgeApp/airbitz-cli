import { command, UsageError } from '../command.js'

command(
  'pin-login',
  {
    usage: '<username> <pin>',
    help: 'Logs the user in with the device-specific PIN',
    needsContext: true
  },
  function(console, session, argv) {
    if (argv.length !== 2) throw new UsageError(this)
    const username = argv[0]
    const pin = argv[1]

    return session.context.loginWithPIN(username, pin).then(account => {
      session.account = account
      session.login = account.login
      return account
    })
  }
)

command(
  'pin-delete',
  {
    usage: '',
    help: 'Removes the PIN from an account',
    needsLogin: true
  },
  function(console, session, argv) {
    if (argv.length !== 0) throw new UsageError(this)

    return session.account.deletePin()
  }
)

command(
  'pin-setup',
  {
    usage: '<pin>',
    help: 'Creates or changes the PIN for an account',
    needsLogin: true
  },
  function(console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    const pin = argv[0]

    return session.account.changePin(pin)
  }
)
