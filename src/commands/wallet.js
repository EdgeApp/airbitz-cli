import { UsageError, command } from '../command.js'

command(
  'wallet-list',
  {
    help: 'Lists the currency wallets in an account',
    needsAccount: true
  },
  function (console, session, argv) {
    if (argv.length !== 0) throw new UsageError(this)

    function showWallets (ids) {
      for (const id of ids) {
        const { type } = session.account.getWallet(id)
        const currencyWallet = session.account.currencyWallets[id]
        if (currencyWallet) {
          console.log(` ${id} (${type}): "${currencyWallet.name}"`)
        } else {
          console.log(` ${id} (${type}) <not loaded>`)
        }
      }
    }

    console.log('Active:')
    showWallets(session.account.activeWalletIds)
    console.log('Archived:')
    showWallets(session.account.archivedWalletIds)
  }
)

command(
  'wallet-undelete',
  {
    help: "Removes a key's deleted flag",
    usage: '<wallet-id>',
    needsAccount: true
  },
  function (console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    const walletId = argv[0]

    const opts = {}
    opts[walletId] = { deleted: false }
    return session.account.changeWalletStates(opts)
  }
)
