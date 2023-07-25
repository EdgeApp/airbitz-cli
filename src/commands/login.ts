import { base64 } from 'rfc4648'

import { command, UsageError } from '../command'
import { base58 } from '../util/encoding'
import { getInternalStuff } from '../util/internal'

command(
  'account-remove',
  {
    usage: '<username>',
    help: 'Deprecated. Use username-delete.',
    needsContext: true
  },
  async function (console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    const username = argv[0]

    await session.context.deleteLocalAccount(username)
  }
)

command(
  'account-available',
  {
    usage: '<username>',
    help: 'Determines whether or not a username is available',
    needsContext: true
  },
  async function (console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    const username = argv[0]

    await session.context
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
  async function (console, session, argv) {
    if (argv.length !== 3) throw new UsageError(this)
    const username = argv[0]
    const password = argv[1]
    const pin = argv[2]

    await session.context
      .createAccount({ username, password, pin })
      .then(account => {
        session.account = account
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
  async function (console, session, argv) {
    if (argv.length !== 0) throw new UsageError(this)

    const account = session.account
    // @ts-expect-error
    session.account = undefined
    // @ts-expect-error
    session.wallet = undefined
    await account.logout()
  }
)

command(
  'messages-fetch',
  {
    usage: '',
    help: 'Fetches login messages for all local users',
    needsContext: true
  },
  async function (console, session, argv) {
    if (argv.length !== 0) throw new UsageError(this)
    await session.context
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
  async function (console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    const username = argv[0]

    const internal = getInternalStuff(session.context)
    await internal.hashUsername(username).then(hash => {
      console.log('base64', base64.stringify(hash))
      console.log('base58', base58.stringify(hash))
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
  function (console, session, argv) {
    if (argv.length !== 0) throw new UsageError(this)

    console.log(session.context.localUsers)
  }
)

command(
  'username-delete',
  {
    usage: '',
    help: 'Forgets a username, deleting its credentials from the device',
    needsContext: true
  },
  async function (console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    const username = argv[0]

    await session.context.deleteLocalAccount(username)
  }
)

command(
  'account-key',
  {
    usage: '',
    help: 'Shows the login key for the account',
    needsAccount: true
  },
  async function (console, session, argv) {
    if (argv.length !== 0) throw new UsageError(this)

    console.log(await session.account.getLoginKey())
  }
)

command(
  'key-login',
  {
    usage: '<username> <account-key>',
    help: 'Logs the user in with the account-key',
    needsContext: true
  },
  async function (console, session, argv) {
    if (argv.length !== 2) throw new UsageError(this)
    const username = argv[0]
    const loginKey = argv[1]

    await session.context.loginWithKey(username, loginKey).then(account => {
      session.account = account
    })
  }
)
