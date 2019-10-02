import { UsageError, command } from '../command.js'

command(
  'wallet-list',
  {
    help: 'Lists the wallets in an account',
    needsAccount: true
  },
  function(console, session, argv) {
    if (argv.length !== 0) throw new UsageError(this)

    session.account.listWalletIds().forEach(id => {
      const wallet = session.account.getWallet(id)
      console.log(
        `$(id) (${wallet.type}) = ${JSON.stringify(wallet.repoKeys, null, 2)}`
      )
    })
  }
)

command(
  'wallet-undelete',
  {
    help: "Removes a key's deleted flag",
    usage: '<wallet-id>',
    needsAccount: true
  },
  function(console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    const walletId = argv[0]

    const opts = {}
    opts[walletId] = { deleted: false }
    return session.account.changeWalletStates(opts)
  }
)
