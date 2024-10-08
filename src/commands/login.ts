import { asMaybe, asObject } from 'cleaners'
import { asBase64 } from 'edge-core-js'
import { base64 } from 'rfc4648'

import { command, UsageError } from '../command'
import { base58 } from '../util/encoding'
import { getInternalStuff } from '../util/internal'

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
    const username = session.context.fixUsername(argv[0])

    const internal = getInternalStuff(session.context)
    const hash = await internal.hashUsername(username)
    console.log('base64', base64.stringify(hash))
    console.log('base58', base58.stringify(hash))

    // Fetch the loginId too:
    const response = await internal
      .authRequest('POST', '/v2/login', {
        userId: hash
      })
      .catch(error => console.log(String(error)))
    const clean = asMaybe(asObject({ loginId: asBase64 }))(response)
    if (clean != null) {
      console.log('loginId base64', base64.stringify(clean.loginId))
      console.log('loginId base58', base58.stringify(clean.loginId))
    }
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
    const username = session.context.fixUsername(argv[0])

    const userInfo = session.context.localUsers.find(
      info => info.username === username
    )
    if (userInfo == null) {
      console.log(`Cannot find user "${username}"`)
      return
    }

    await session.context.forgetAccount(userInfo.loginId)
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
