import { command, UsageError } from '../command.js'

command(
  'password-login',
  {
    usage: '<username> <password> [<otp secret>]',
    help: 'Logs the user in with a username and password',
    needsContext: true
  },
  function(console, session, argv) {
    if (argv.length < 2 || argv.length > 3) throw new UsageError(this)
    const username = argv[0]
    const password = argv[1]
    const otpSecret = argv[2]

    return session.context
      .loginWithPassword(username, password, { otp: otpSecret })
      .then(account => {
        session.account = account
        session.login = account.login
        return account
      })
  }
)

command(
  'password-setup',
  {
    usage: '<password>',
    help: 'Creates or changes the password for a login',
    needsLogin: true
  },
  function(console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    const password = argv[0]

    return session.account.changePassword(password)
  }
)
