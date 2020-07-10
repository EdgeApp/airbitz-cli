import { command, UsageError } from '../command.js'

command(
  'edge-login',
  {
    usage: '',
    help: 'Requests an edge login',
    needsContext: true
  },
  function(console, session, argv) {
    if (argv.length !== 0) throw new UsageError(this)

    // Subscribe to login events:
    const out = new Promise((resolve, reject) => {
      session.context.on('login', account => {
        session.account = account
        resolve()
      })
      session.context.on('loginError', ({ error }) => reject(error))
    })

    // Request the login:
    return session.context.requestEdgeLogin({}).then(pending => {
      console.log(`airbitz://edge/${pending.id}`)
      return out
    })
  }
)
