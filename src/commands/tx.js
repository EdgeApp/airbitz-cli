import { command, UsageError } from '../command.js'
import { ShitcoinPlugin } from 'airbitz-currency-shitcoin'
import { EthereumPlugin } from 'airbitz-currency-ethereum'
import { DashPlugin } from 'airbitz-currency-dash'

/**
 * Ensures that the session contains a shitcoin plugin, if it doesn't already.
 * This needs to happen once when the app first boots.
 */
function makePlugins (session) {
  if (!session.currencyPlugins) {
    session.currencyPlugins = {}
    const promiseArray = []
    let p = ShitcoinPlugin.makePlugin({
      io: session.context.io
    })
    promiseArray.push(p)

    p = EthereumPlugin.makePlugin({
      io: session.context.io
    })
    promiseArray.push(p)

    p = DashPlugin.makePlugin({
      io: session.context.io
    })
    promiseArray.push(p)

    return Promise.all(promiseArray).then(result => {
      session.currencyPlugins.shitcoin = result[0]
      session.currencyPlugins.ethereum = result[1]
      session.currencyPlugins.dash = result[2]
      return 0
    })
  } else {
    return Promise.resolve(0)
  }
}

command(
  'tx-info',
  {
    usage: '<plugin>',
    help: 'Get info on the currency plugin',
    needsContext: true
  },
  function (console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    makePlugins(session).then(() => {
      console.log(session.currencyPlugins[argv[0]].currencyInfo)
      return 0
    })
  }
)

command(
  'tx-make-engine',
  {
    usage: '<plugin> <walletType>',
    help: 'Creates a blockchain engine for the selected wallet',
    needsContext: true
  },
  function (console, session, argv) {
    if (argv.length !== 2) throw new UsageError(this)
    makePlugins(session).then(() => {
      const walletType = argv[1]

      const masterKeys = session.currencyPlugins[argv[0]].createMasterKeys(walletType)

      // Hard coded private keys for ease of development
      // (Otherwise you would have to do a full login on each refresh):
      const keyInfo = {
        id: '33LtiHFcFoXqhdrX61zOVut6QzVCBVl8LvChK1HneTc=',
        type: 'wallet:' + walletType,
        keys: masterKeys
      }

      const callbacks = {
        onAddressesChecked (progressRatio) {
          console.log('onAddressesCheck', progressRatio)
        },
        onBalanceChanged (currencyCode, balance) {
          console.log('onBalanceChange:' + currencyCode + ' ' + balance)
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

      // Actually make the engine:
      session.currencyWallet = session.currencyPlugins[argv[0]].makeEngine(keyInfo, {
        pluginFolder: session.context.io.folder.folder('pluginFolder'),
        walletFolder: session.context.io.folder.folder('walletFolder'),
        walletLocalFolder: session.context.io.folder.folder('walletLocalFolder'),
        callbacks
      })
      return 0
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
    if (argv.length > 2) throw new UsageError(this)
    if (!session.currencyWallet) {
      throw new Error('Call tx-make-engine first')
    }

    const opts = {}
    if (argv.length === 2) {
      opts[argv[0]] = argv[1]
    }

    const ret = session.currencyWallet.startEngine(opts)
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
    usage: '[<currencyCode>]',
    help: 'Gets the wallet balance',
    needsContext: true
  },
  function (console, session, argv) {
    if (argv.length !== 0 && argv.length !== 1) throw new UsageError(this)
    if (session.currencyWallet == null) {
      throw new Error('Call tx-make-engine first')
    }

    let opts = null
    if (argv.length === 1) {
      opts = {}
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

    let opts = null
    if (argv.length > 0) {
      opts = {}
      opts.currencyCode = argv[0]
    }
    return session.currencyWallet
      .getTransactions(opts)
      .then(txs => {
        console.log(`got ${txs.length} transactions`)
        return txs.forEach(tx => console.log(tx))
      })
  }
)

command(
  'tx-get-address',
  {
    usage: '',
    help: 'Gets a fresh, unused address from the txlib',
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
  'tx-add-gap-addresses',
  {
    usage: '<address> <address> ...',
    help: 'Marks addresses as used and increases the gap limit',
    needsContext: true
  },
  function (console, session, argv) {
    if (session.currencyWallet == null) {
      throw new Error('Call tx-make-engine first')
    }
    if (argv.length < 1) throw new UsageError(this)

    session.currencyWallet.addGapLimitAddresses(argv, {})
    console.log('done')

    return Promise.resolve()
  }
)

command(
  'tx-is-address-used',
  {
    usage: '<address>',
    help: 'Gets the state of an address',
    needsContext: true
  },
  function (console, session, argv) {
    if (session.currencyWallet == null) {
      throw new Error('Call tx-make-engine first')
    }
    if (argv.length !== 1) throw new UsageError(this)
    const address = argv[0]

    console.log(session.currencyWallet.isAddressUsed(address, {}))

    return Promise.resolve()
  }
)

command(
  'tx-spend',
  {
    usage: '<address> <amount> [<currencyCode>]',
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
    const spendTarget = {
      publicAddress: address,
      nativeAmount: amount
    }

    if (argv.length > 2) {
      spendTarget.currencyCode = argv[2]
    }

    const spend = {
      spendTargets: [ spendTarget ],
      networkFeeOption: 'standard'
    }

    session.currencyWallet.makeSpend(spend)
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
        console.log('done spending')
        return console.log(tx)
      })
  }
)

command(
  'tx-enable-tokens',
  {
    usage: '<currencyCode> <currencyCode> ...',
    help: 'Enable token support',
    needsContext: true
  },
  function (console, session, argv) {
    if (session.currencyWallet == null) {
      throw new Error('Call tx-make-engine first')
    }
    if (argv.length < 1) throw new UsageError(this)

    session.currencyWallet.enableTokens(argv)
    return true
  }
)
