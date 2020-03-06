import { base64 } from 'rfc4648'

import { command, UsageError } from '../command.js'
import { base58 } from '../encoding.js'

command(
  'account-remove',
  {
    usage: '<username>',
    help: 'Removes any locally-stored data for the given username',
    needsContext: true
  },
  function(console, session, argv) {
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
  function(console, session, argv) {
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
  function(console, session, argv) {
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
  'logout',
  {
    usage: '',
    help: 'Logs out of the current account',
    needsAccount: true
  },
  function(console, session, argv) {
    if (argv.length !== 0) throw new UsageError(this)

    const account = session.account
    session.account = undefined
    session.login = undefined
    session.wallet = undefined
    return account.logout()
  }
)

command(
  'messages-fetch',
  {
    usage: '',
    help: 'Fetches login messages for all local users',
    needsContext: true
  },
  function(console, session, argv) {
    if (argv.length !== 0) throw new UsageError(this)
    return session.context
      .fetchLoginMessages()
      .then(messages => console.log(messages))
  }
)

command(
  'username-hash',
  {
    usage: '<username>',
    help: 'Hashes a username using scrypt',
    needsContext: true
  },
  function(console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    const username = argv[0]

    const internal = session.context.$internalStuff
    return internal.hashUsername(username).then(hash => {
      console.log('base64', base64.stringify(hash))
      console.log('base58', base58.stringify(hash))
      return null
    })
  }
)

command(
  'username-list',
  {
    usage: '',
    help: 'Lists the usernames on this device',
    needsContext: true
  },
  function(console, session, argv) {
    if (argv.length !== 0) throw new UsageError(this)

    console.log(session.context.localUsers)
  }
)

command(
  'account-key',
  {
    usage: '',
    help: 'Shows the login key for the account',
    needsAccount: true
  },
  function(console, session, argv) {
    if (argv.length !== 0) throw new UsageError(this)

    console.log(session.account.loginKey)
  }
)

command(
  'key-login',
  {
    usage: '<username> <account-key>',
    help: 'Logs the user in with the account-key',
    needsContext: true
  },
  function(console, session, argv) {
    if (argv.length !== 2) throw new UsageError(this)
    const username = argv[0]
    const loginKey = argv[1]

    return session.context.loginWithKey(username, loginKey).then(account => {
      session.account = account
      session.login = account.login
      return account
    })
  }
)
