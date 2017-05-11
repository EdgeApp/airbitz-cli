import { command, UsageError } from '../command.js'
import { internal } from 'airbitz-core-js'

const { base64, base58, hashUsername } = internal

command(
  'account-remove',
  {
    usage: '<username>',
    help: 'Removes any locally-stored data for the given username',
    needsContext: true
  },
  function (console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    const username = argv[0]

    return session.context.removeUsername(username)
  }
)

command(
  'account-available',
  {
    usage: '<username>',
    help: 'Determines whether or not a username is available',
    needsContext: true
  },
  function (console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    const username = argv[0]

    return session.context
      .usernameAvailable(username)
      .then(available => console.log(available ? 'Available' : 'Not available'))
  }
)

command(
  'account-create',
  {
    usage: '<username> <password> <pin>',
    help: 'Create a login on the auth server',
    needsContext: true
  },
  function (console, session, argv) {
    if (argv.length !== 3) throw new UsageError(this)
    const username = argv[0]
    const password = argv[1]
    const pin = argv[2]

    return session.context
      .createAccount(username, password, pin)
      .then(account => {
        session.account = account
        session.login = account.login
        return account
      })
  }
)

command(
  'username-hash',
  {
    usage: '<username>',
    help: 'Hashes a username using scrypt',
    needsContext: true
  },
  function (console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    const username = argv[0]

    return hashUsername(username).then(hash => {
      console.log('base64', base64.stringify(hash))
      console.log('base58', base58.stringify(hash))
      return null
    })
  }
)
