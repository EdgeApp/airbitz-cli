import { command, UsageError } from '../command'

command(
  'exchange-convert',
  {
    usage: '<from-currency> <to-currency> [<amount>]',
    help: 'Performs an exchange-rate lookup',
    needsAccount: true
  },
  async function (console, session, argv) {
    if (argv.length < 2 || argv.length > 3) throw new UsageError(this)
    const [fromCurrency, toCurrency, amount = 1] = argv

    console.log(
      await session.account.exchangeCache.convertCurrency(
        fromCurrency,
        toCurrency,
        Number(amount)
      )
    )
  }
)
