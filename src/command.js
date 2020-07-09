const commands = {}

/**
 * Creates an error indicating a problem with the command-line arguments.
 * @param command The command that was invoked. Can be null.
 */
export class UsageError extends Error {
  constructor(command, message = 'Incorrect arguments') {
    super(message)
    this.command = command
    this.name = 'UsageError'
  }
}

/**
 * Creates a new command, and adds it to the global command registry.
 */
export function command(name, opts, body) {
  if (name in commands && !opts.replace) {
    throw new Error(`Command "${name}" defined twice`)
  }

  const cmd = {
    help: opts.help,
    invoke: body,
    name: name,
    usage: opts.usage
  }

  // Expand the needs flags:
  cmd.needsWallet = opts.needsWallet
  cmd.needsAccount = opts.needsAccount | cmd.needsWallet
  cmd.needsLogin = opts.needsLogin | cmd.needsAccount
  cmd.needsContext = opts.needsContext | cmd.needsLogin

  commands[name] = cmd
  return cmd
}

/**
 * Finds the command with the given name.
 */
export function findCommand(name) {
  const cmd = commands[name]
  if (cmd == null) throw new UsageError(null, `No command named "${name}"`)
  return cmd
}

/**
 * Returns the list of all commands, in sorted order.
 */
export function listCommands() {
  return Object.keys(commands).sort()
}
