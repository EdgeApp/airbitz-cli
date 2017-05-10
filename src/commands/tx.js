import { command, UsageError } from '../command.js'
import { makeCurrencyWallet } from 'airbitz-core-js'
import { makeShitcoinPlugin } from 'airbitz-currency-shitcoin'

/**
 * Ensures that the session contains a shitcoin plugin, if it doesn't aready.
 * This needs to happen once when the app first boots.
 */
function makePlugin (session) {
  if (session.shitcoinPlugin == null) {
    session.shitcoinPlugin = makeShitcoinPlugin({
      io: session.context.io
    })
  }
}

command(
  'tx-info',
  {
    usage: '',
    help: 'Get info on the currency plugin',
    needsContext: true
  },
  function (console, session, argv) {
    if (argv.length !== 0) throw new UsageError(this)
    makePlugin(session)

    console.log(session.shitcoinPlugin.getInfo())

    return Promise.resolve()
  }
)

command(
  'tx-make-engine',
  {
    usage: '<wallet-id>',
    help: 'Creates an blockchain engine for the selected wallet',
    needsAccount: true
  },
  function (console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    const walletId = argv[0]
    makePlugin(session)

    const keyInfo = session.account.allKeys.find(info => info.id === walletId)
    if (keyInfo == null) {
      throw new UsageError(this, `Cannot find wallet ${walletId}`)
    }

    const callbacks = {
      onAddressesChecked (progressRatio) {
        console.log('onAddressesCheck', progressRatio)
      },
      onBalanceChanged (balance) {
        console.log('onBalanceChange', balance)
      },
      onBlockHeightChanged (height) {
        console.log('onBlockHeightChange', height)
      },
      onNewTransactions (transactionList) {
        console.log('onNewTransactions')
        console.log(transactionList)
      },
      onTransactionsChanged (transactionList) {
        console.log('onTransactionsChanged')
        console.log(transactionList)
      }
    }

    return makeCurrencyWallet(keyInfo, {
      account: session.account,
      plugin: session.shitcoinPlugin,
      callbacks
    }).then(currencyWallet => {
      session.currencyWallet = currencyWallet
      return currencyWallet
    })
  }
)

command(
  'tx-start-engine',
  {
    usage: '',
    help: 'Start the wallet tx engine background processes',
    needsContext: true
  },
  function (console, session, argv) {
    if (argv.length !== 0) throw new UsageError(this)
    if (session.currencyWallet == null) {
      throw new Error('Call tx-make-engine first')
    }

    const ret = session.currencyWallet.startEngine()
    return ret
  }
)

command(
  'tx-height',
  {
    usage: '',
    help: 'Gets the block height of wallet engine',
    needsContext: true
  },
  function (console, session, argv) {
    if (argv.length !== 0) throw new UsageError(this)
    if (session.currencyWallet == null) {
      throw new Error('Call tx-make-engine first')
    }

    console.log('height: ', session.currencyWallet.getBlockHeight())
    return Promise.resolve()
  }
)

command(
  'tx-balance',
  {
    usage: '<currencyCode>',
    help: 'Gets the wallet balance',
    needsContext: true
  },
  function (console, session, argv) {
    if (argv.length !== 0 && argv.length !== 1) throw new UsageError(this)
    if (session.currencyWallet == null) {
      throw new Error('Call tx-make-engine first')
    }

    const opts = {}
    if (argv.length === 1) {
      opts.currencyCode = argv[0]
    }

    console.log('balance: ', session.currencyWallet.getBalance(opts))
    return Promise.resolve()
  }
)

command(
  'tx-transactions',
  {
    usage: '[<currencyCode>]',
    help: 'Gets the transactions in the wallet engine',
    needsContext: true
  },
  function (console, session, argv) {
    if (argv.length > 1) throw new UsageError(this)
    if (session.currencyWallet == null) {
      throw new Error('Call tx-make-engine first')
    }

    let currencyCode
    if (argv.length > 0) {
      currencyCode = argv[0]
    }
    return session.currencyWallet
      .getTransactions({ currencyCode })
      .then(txs => {
        console.log(`got ${txs.length} transactions`)
        return txs.forEach(tx => console.log(tx))
      })
  }
)

command(
  'tx-address',
  {
    usage: '',
    help: 'Gets a fresh address from the watcher',
    needsContext: true
  },
  function (console, session, argv) {
    if (argv.length !== 0) throw new UsageError(this)
    if (session.currencyWallet == null) {
      throw new Error('Call tx-make-engine first')
    }

    const address = session.currencyWallet.getFreshAddress({})
    console.log(address)

    return Promise.resolve()
  }
)

command(
  'tx-address-lock',
  {
    usage: '<address>',
    help: "Marks an address as used, so it won't be shown again",
    needsContext: true
  },
  function (console, session, argv) {
    if (session.currencyWallet == null) {
      throw new Error('Call tx-make-engine first')
    }
    if (argv.length !== 1) throw new UsageError(this)
    const address = argv[0]

    session.currencyWallet.lockReceiveAddress({ publicAddress: address })
    console.log('done')

    return Promise.resolve()
  }
)

command(
  'tx-spend',
  {
    usage: '<address> <amount> <currencyCode>',
    help: 'Sends money to an address',
    needsContext: true
  },
  function (console, session, argv) {
    if (session.currencyWallet == null) {
      throw new Error('Call tx-make-engine first')
    }
    if (argv.length < 2 || argv.length > 3) throw new UsageError(this)
    const address = argv[0]
    const amount = argv[1]
    let currencyCode
    if (argv.length > 2) {
      currencyCode = argv[2]
    }

    const spend = {
      spendTargets: [
        {
          currencyCode,
          publicAddress: address,
          amountSatoshi: amount
        }
      ],
      networkFeeOption: 'standard'
    }

    return session.currencyWallet
      .makeSpend(spend)
      .then(tx => {
        return session.currencyWallet.signTx(tx)
      })
      .then(tx => {
        return session.currencyWallet.broadcastTx(tx)
      })
      .then(tx => {
        return session.currencyWallet.saveTx(tx)
      })
      .then(tx => {
        return console.log('done spending')
      })
  }
)
