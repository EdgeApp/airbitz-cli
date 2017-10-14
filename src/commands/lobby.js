import { command, UsageError } from '../command.js'
import { internal } from 'airbitz-core-js'
const { makeLobby } = internal

command(
  'lobby-create',
  {
    usage: '<request-json>',
    help: 'Puts the provided lobby request JSON on the auth server',
    needsContext: true
  },
  function (console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    const lobbyRequest = JSON.parse(argv[0])

    return makeLobby(
      session.context.internalUnitTestingHack,
      lobbyRequest
    ).then(lobby => {
      console.log('Created lobby ' + lobby.lobbyId)
      return new Promise((resolve, reject) => {
        const subscription = lobby.subscribe(reply => {
          console.log(JSON.stringify(reply, null, 2))
          subscription.unsubscribe()
          resolve(reply)
        }, reject)
      })
    })
  }
)
