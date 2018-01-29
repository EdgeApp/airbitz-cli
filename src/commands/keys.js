import { UsageError, command } from '../command.js'

command(
  'key-list',
  {
    help: 'Lists the keys in an account',
    needsAccount: true
  },
  function (console, session, argv) {
    if (argv.length !== 0) throw new UsageError(this)

    console.log(session.account.allKeys)
  }
)

command(
  'key-add',
  {
    help: 'Attaches a key to an account',
    usage: '<key-info-json>',
    needsAccount: true
  },
  function (console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    const keyInfo = JSON.parse(argv[0])

    if (keyInfo.type == null) {
      throw new UsageError(this, 'Missing `type` field')
    }
    if (keyInfo.id == null) {
      throw new UsageError(this, 'Missing `id` field')
    }
    if (keyInfo.keys == null) {
      throw new UsageError(this, 'Missing `keys` field')
    }

    return session.account.createWallet(keyInfo.type, keyInfo.keys)
  }
)

command(
  'key-undelete',
  {
    help: "Removes a key's deleted flag",
    usage: '<wallet-id>',
    needsAccount: true
  },
  function (console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    const walletId = JSON.parse(argv[0])

    const opts = {}
    opts[walletId] = { deleted: false }
    return session.account.changeKeyStates(opts)
  }
)
