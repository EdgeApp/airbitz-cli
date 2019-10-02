import { UsageError, command } from '../command.js'

command(
  'exchange-convert',
  {
    usage: '<from-currency> <to-currency> [<amount>]',
    help: 'Performs an exchange-rate lookup',
    needsAccount: true
  },
  function(console, session, argv) {
    if (argv.length < 2 || argv.length > 3) throw new UsageError(this)
    const fromCurrency = argv[0]
    const toCurrency = argv[1]
    const amount = argv[2] || 1

    console.log(
      session.account.exchangeCache.convertCurrency(
        fromCurrency,
        toCurrency,
        amount
      )
    )
  }
)
