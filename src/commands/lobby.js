import { UsageError, command } from '../command.js'

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

    const internal = session.context.$internalStuff
    return internal.makeLobby(lobbyRequest).then(lobby => {
      console.log('Created lobby ' + lobby.lobbyId)
      return new Promise((resolve, reject) => {
        lobby.on('error', reject)
        lobby.watch('replies', replies => {
          if (replies.length === 0) return
          console.log(JSON.stringify(replies[0], null, 2))
          resolve(replies[0])
          lobby.close()
        })
      })
    })
  }
)

command(
  'lobby-fetch',
  {
    usage: '<lobbyId>',
    help: "Fetches a lobby's contents from the server",
    needsContext: true
  },
  function (console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    const lobbyId = argv[0]

    const internal = session.context.$internalStuff
    return internal
      .fetchLobbyRequest(lobbyId)
      .then(request => console.log(JSON.stringify(request, null, 2)))
  }
)

command(
  'lobby-reply',
  {
    usage: '<lobbyId> <reply-json>',
    help: 'Sends a reply to a lobby',
    needsContext: true
  },
  function (console, session, argv) {
    if (argv.length !== 2) throw new UsageError(this)
    const lobbyId = argv[0]
    const lobbyReply = JSON.parse(argv[1])

    const internal = session.context.$internalStuff
    return internal
      .fetchLobbyRequest(lobbyId)
      .then(request => internal.sendLobbyReply(lobbyId, request, lobbyReply))
  }
)

command(
  'lobby-login-fetch',
  {
    usage: 'lobbyId',
    help: 'Fetches an Edge login request from the lobby server',
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
