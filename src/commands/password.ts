import { command, UsageError } from '../command'

command(
  'password-login',
  {
    usage: '<username> <password> [<otp secret>]',
    help: 'Logs the user in with a username and password',
    needsContext: true
  },
  async function (console, session, argv) {
    if (argv.length < 2 || argv.length > 3) throw new UsageError(this)
    const username = argv[0]
    const password = argv[1]
    const otpSecret = argv[2]

    await session.context
      .loginWithPassword(username, password, { otp: otpSecret })
      .then(account => {
        session.account = account
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
  async function (console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    const password = argv[0]

    await session.account.changePassword(password)
  }
)
