import { Disklet } from 'disklet'
import { EdgeContext } from 'edge-core-js'
import { Subscriber } from 'yaob'

/**
 * The JSON structure placed in the lobby as a request.
 */
export interface LobbyRequest {
  timeout?: number
  publicKey?: string
  loginRequest?: { appId: string }
  replies?: unknown[]
}

/**
 * The requesting side of an Edge login lobby.
 * The `replies` property will update as replies come in.
 */
interface EdgeLobby {
  readonly on: Subscriber<{ error: Error }>
  readonly watch: Subscriber<EdgeLobby>

  readonly lobbyId: string
  readonly replies: unknown[]
  close(): void
}

export interface SyncResult {
  changes: { [path: string]: any }
  status: {
    lastHash?: string | null
    lastSync: number
  }
}

/**
 * A secret internal API which has some goodies for the CLI
 * and for unit testing.
 */
export interface EdgeInternalStuff {
  authRequest(method: string, path: string, body?: {}): Promise<unknown>
  hashUsername(username: string): Promise<Uint8Array>
  makeLobby(lobbyRequest: LobbyRequest, period?: number): Promise<EdgeLobby>
  fetchLobbyRequest(lobbyId: string): Promise<LobbyRequest>
  sendLobbyReply(
    lobbyId: string,
    lobbyRequest: LobbyRequest,
    replyData: unknown
  ): Promise<void>
  syncRepo(syncKey: Uint8Array): Promise<SyncResult>
  getRepoDisklet(syncKey: Uint8Array, dataKey: Uint8Array): Promise<Disklet>
}

/**
 * Get the secret Edge internal methods off of the context object.
 */
export function getInternalStuff(context: EdgeContext): EdgeInternalStuff {
  const typeHack: any = context
  return typeHack.$internalStuff
}
