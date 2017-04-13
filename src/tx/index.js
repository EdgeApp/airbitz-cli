import { command, UsageError } from '../command.js'
import { TxLibBTC } from '../../../lib-stubs/dist/index.es.js'
import { ABCDataStore } from './dataStore.js'

command(
  'tx-info',
  {
    usage: '',
    help: 'Starts up the TX watcher library',
    needsContext: true
  },
  function (session, argv) {
    if (argv.length !== 0) throw new UsageError(this)

    console.log(TxLibBTC.getInfo())

    return Promise.resolve()
  }
)

command(
  'tx-start',
  {
    usage: '',
    help: 'Starts up the TX watcher library',
    needsContext: true
  },
  function (session, argv) {
    if (argv.length !== 0) throw new UsageError(this)

    const abcTxLibAccess = {
      accountLocalDataStore: new ABCDataStore(),
      walletLocalDataStore: new ABCDataStore(),
      accountDataStore: new ABCDataStore(),
      walletDataStore: new ABCDataStore()
    }
    const options = {}
    const callbacks = {
      abcWalletTxAddressesChecked (...rest) {
        console.log('abcWalletTxAddressesChecked', rest)
      },
      transactionsChanged (...rest) {
        console.log('transactionsChanged', rest)
      },
      blockHeightChanged (...rest) {
        console.log('blockHeightChanged', rest)
      }
    }

    session.txLib = TxLibBTC.makeEngine(abcTxLibAccess, options, callbacks)
    return Promise.resolve()
  }
)

command(
  'tx-start',
  {
    usage: '',
    help: 'Starts up the TX watcher library',
    needsContext: true
  },
  function (session, argv) {
    if (argv.length !== 0) throw new UsageError(this)

    const abcTxLibAccess = {}
    const options = {}
    const callbacks = {
      abcWalletTxAddressesChecked (...rest) {
        console.log('abcWalletTxAddressesChecked', rest)
      }
    }

    session.txLib = TxLibBTC.makeEngine(abcTxLibAccess, options, callbacks)
    return Promise.resolve()
  }
)

command(
  'tx-height',
  {
    usage: '',
    help: 'Gets the height of the running tx library',
    needsContext: true
  },
  function (session, argv) {
    if (argv.length !== 0) throw new UsageError(this)
    if (session.txLib == null) throw new Error('Call tx-start first')

    console.log('height: ', session.txLib.getBlockHeight())
    return Promise.resolve()
  }
)

command(
  'tx-height',
  {
    usage: '',
    help: 'Gets the block height of the running tx library',
    needsContext: true
  },
  function (session, argv) {
    if (argv.length !== 0) throw new UsageError(this)
    if (session.txLib == null) throw new Error('Call tx-start first')

    console.log('height: ', session.txLib.getBlockHeight())
    return Promise.resolve()
  }
)

command(
  'tx-balance',
  {
    usage: '',
    help: 'Gets the wallet balance',
    needsContext: true
  },
  function (session, argv) {
    if (argv.length !== 0) throw new UsageError(this)
    if (session.txLib == null) throw new Error('Call tx-start first')

    console.log('balance: ', session.txLib.getBalance())
    return Promise.resolve()
  }
)

command(
  'tx-transactions',
  {
    usage: '',
    help: 'Gets the transactions in the watcher',
    needsContext: true
  },
  function (session, argv) {
    if (argv.length !== 0) throw new UsageError(this)
    if (session.txLib == null) throw new Error('Call tx-start first')

    return session.txLib.getTransactions(null).then(txs => {
      console.log(`got ${txs.length} transactions`)
      txs.forEach(tx => console.log(JSON.stringify(tx, null, 1)))
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
  function (session, argv) {
    if (argv.length !== 0) throw new UsageError(this)
    if (session.txLib == null) throw new Error('Call tx-start first')

    const address = session.txLib.getFreshAddress({})
    console.log('address: ' + address)

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
  function (session, argv) {
    if (session.txLib == null) throw new Error('Call tx-start first')
    if (argv.length !== 1) throw new UsageError(this)
    const address = argv[0]

    session.txLib.addGapLimitAddresses([address], {})
    console.log('done')

    return Promise.resolve()
  }
)

command(
  'tx-address-state',
  {
    usage: '<address>',
    help: 'Gets the state of an address',
    needsContext: true
  },
  function (session, argv) {
    if (session.txLib == null) throw new Error('Call tx-start first')
    if (argv.length !== 1) throw new UsageError(this)
    const address = argv[0]

    console.log(session.txLib.isAddressUsed(address, {}))

    return Promise.resolve()
  }
)

command(
  'tx-spend',
  {
    usage: '<address> <amount>',
    help: 'Sends money to an address',
    needsContext: true
  },
  function (session, argv) {
    if (session.txLib == null) throw new Error('Call tx-start first')
    if (argv.length !== 2) throw new UsageError(this)
    const address = argv[0]
    const amount = argv[1] | 0

    const spend = {
      spendTargets: [
        {
          publicAddress: address,
          amountSatoshi: amount
        }
      ],
      networkFeeOption: 'standard'
    }

    return session.txLib
      .makeSpend(spend)
      .then(tx => {
        return session.txLib.signTx(tx)
      })
      .then(tx => {
        return session.txLib.broadcastTx(tx)
      })
      .then(tx => {
        return session.txLib.saveTx(tx)
      }).then(tx => {
        console.log('done spending')
      }).catch(e => {
        console.error(e)
      })
  }
)