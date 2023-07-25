import { EdgeWalletStates } from 'edge-core-js'

import { command, UsageError } from '../command'

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
  async function (console, session, argv) {
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

    await session.account.createWallet(keyInfo.type, keyInfo.keys)
  }
)

command(
  'key-get',
  {
    help: 'Reads a raw private key',
    usage: '<wallet-id>',
    needsAccount: true
  },
  async function (console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    const [walletId] = argv

    const raw = await session.account.getRawPrivateKey(walletId)
    console.log(raw)
  }
)

command(
  'key-undelete',
  {
    help: "Removes a key's deleted flag",
    usage: '<wallet-id>',
    needsAccount: true
  },
  async function (console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    const [walletId] = argv

    const opts: EdgeWalletStates = {}
    opts[walletId] = { deleted: false }
    await session.account.changeWalletStates(opts)
  }
)
