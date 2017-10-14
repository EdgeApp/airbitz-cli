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

command(
  'lobby-fetch',
  {
    usage: 'lobbyId',
    help: 'Fetches an edge request from the lobby server',
    needsAccount: true
  },
  function (console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    const lobbyId = argv[0]

    return session.account.fetchLobby(lobbyId).then(lobby => {
      const { loginRequest } = lobby
      console.log('loginRequest: ' + (loginRequest ? 'yes' : 'no'))
      if (loginRequest) {
        console.log(' appId: ' + loginRequest.appId)
        console.log(' displayName: ' + loginRequest.displayName)
        console.log(' displayImageUrl: ' + loginRequest.displayImageUrl)
      }
      return void 0
    })
  }
)

command(
  'lobby-login-approve',
  {
    usage: 'lobbyId',
    help: 'Approves an edge-login request',
    needsAccount: true
  },
  function (console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    const lobbyId = argv[0]

    return session.account.fetchLobby(lobbyId).then(lobby => {
      const { loginRequest } = lobby
      if (!loginRequest) {
        throw new Error('This lobby is not requesting an edge login.')
      }

      return loginRequest.approve()
    })
  }
)
