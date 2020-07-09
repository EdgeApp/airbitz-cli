import { command, UsageError } from '../command'

command(
  'edge-login',
  {
    usage: '',
    help: 'Requests an edge login',
    needsContext: true
  },
  async function(console, session, argv) {
    if (argv.length !== 0) throw new UsageError(this)

    // Subscribe to login events:
    const out: Promise<void> = new Promise((resolve, reject) => {
      session.context.on('login', account => {
        session.account = account
        resolve()
      })
      session.context.on('loginError', ({ error }) => reject(error))
    })

    // Request the login:
    await session.context.requestEdgeLogin({}).then(pending => {
      console.log(`airbitz://edge/${pending.id}`)
    })

    await out
  }
)
