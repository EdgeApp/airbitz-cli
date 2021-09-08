import { command, UsageError } from '../command'
import { getInternalStuff } from '../util/internal'

command(
  'lobby-create',
  {
    usage: '<request-json>',
    help: 'Puts the provided lobby request JSON on the auth server',
    needsContext: true
  },
  async function (console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    const lobbyRequest = JSON.parse(argv[0])

    const internal = getInternalStuff(session.context)
    const lobby = await internal.makeLobby(lobbyRequest)
    console.log(`Created lobby ${lobby.lobbyId}`)

    await new Promise((resolve, reject) => {
      lobby.on('error', reject)
      lobby.watch('replies', (replies: unknown[]) => {
        if (replies.length === 0) return
        console.log(JSON.stringify(replies[0], null, 2))
        lobby.close()
        resolve(undefined)
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
  async function (console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    const lobbyId = argv[0]

    const internal = getInternalStuff(session.context)
    await internal
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
  async function (console, session, argv) {
    if (argv.length !== 2) throw new UsageError(this)
    const lobbyId = argv[0]
    const lobbyReply = JSON.parse(argv[1])

    const internal = getInternalStuff(session.context)
    const request = await internal.fetchLobbyRequest(lobbyId)
    await internal.sendLobbyReply(lobbyId, request, lobbyReply)
  }
)

command(
  'lobby-login-fetch',
  {
    usage: 'lobbyId',
    help: 'Fetches an Edge login request from the lobby server',
    needsAccount: true
  },
  async function (console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    const lobbyId = argv[0]

    const lobby = await session.account.fetchLobby(lobbyId)
    const { loginRequest } = lobby
    console.log(`loginRequest: ${loginRequest != null ? 'yes' : 'no'}`)
    if (loginRequest != null) {
      const { appId, displayName, displayImageUrl } = loginRequest
      console.log(` appId: ${appId}`)
      console.log(` displayName: ${displayName}`)
      if (displayImageUrl != null) {
        console.log(` displayImageUrl: ${displayImageUrl}`)
      }
    }
  }
)

command(
  'lobby-login-approve',
  {
    usage: 'lobbyId',
    help: 'Approves an edge-login request',
    needsAccount: true
  },
  async function (console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    const lobbyId = argv[0]

    const lobby = await session.account.fetchLobby(lobbyId)
    const { loginRequest } = lobby
    if (loginRequest == null) {
      throw new Error('This lobby is not requesting an edge login.')
    }

    await loginRequest.approve()
  }
)
