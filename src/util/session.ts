import { EdgeAccount, EdgeContext, EdgeCurrencyWallet } from 'edge-core-js'

export interface Session {
  context: EdgeContext
  account: EdgeAccount
  wallet: EdgeCurrencyWallet
}
