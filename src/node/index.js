import '../commands/all'

import {
  addEdgeCorePlugins,
  asMaybePasswordError,
  lockEdgeCorePlugins,
  makeEdgeContext
} from 'edge-core-js'
import exchangePlugins from 'edge-exchange-plugins'
import parse from 'lib-cmdparse'
import { dim, green, red } from 'nanocolors'
import Getopt from 'node-getopt'
import path from 'path'
import readline from 'readline'
import sourceMapSupport from 'source-map-support'
import xdgBasedir from 'xdg-basedir'

import { command, findCommand, listCommands, UsageError } from '../command'
import { printCommandList } from '../commands/help'
import { loadConfig } from './cliConfig'

addEdgeCorePlugins(exchangePlugins)
lockEdgeCorePlugins()

// Display the original source location for errors:
sourceMapSupport.install()

// Program options:
const getopt = new Getopt([
  ['k', 'api-key=ARG', 'Auth server API key'],
  ['a', 'app-id=ARG', 'appId'],
  ['', 'auth-server=ARG', 'Auth server URI'],
  ['c', 'config=ARG', 'Configuration file'],
  ['d', 'directory=ARG', 'Working directory'],
  ['u', 'username=ARG', 'Username'],
  ['p', 'password=ARG', 'Password'],
  ['w', 'wallet=ARG', 'Wallet ID'],
  ['h', 'help', 'Display options']
])

function formatUsage(cmd) {
  // Set up the help options:
  let out = `Usage: ${cmd.name}`
  if (cmd.needsContext) {
    out += ' [-k <api-key>] [-d <work-dir>]'
  }
  if (cmd.needsLogin) {
    out += ' -u <username> -p <password>'
  }
  if (cmd.usage != null) {
    out += ` ${cmd.usage}`
  }
  return out
}

const helpCommand = command(
  'help',
  {
    usage: '[command]',
    help: 'Displays help for any command',
    replace: true
  },
  function (console, session, argv) {
    if (argv.length > 1) throw new UsageError(this, 'Too many parameters')

    if (argv.length === 1) {
      // Command help:
      const cmd = findCommand(argv[0])
      console.log(formatUsage(cmd))
      if (cmd.help != null) {
        console.log(cmd.help)
      }
    } else {
      // Program help:
      getopt.showHelp()
      printCommandList(console)
    }
  }
)

/**
 * If we are passed a single object, format that as proper JSON.
 */
const jsonConsole = {
  log(...args) {
    if (args.length === 1) {
      const arg = args[0]
      if (typeof arg === 'string') {
        console.log(arg)
      } else if (arg instanceof Error) {
        logError(arg)
      } else {
        console.log(green(JSON.stringify(arg, null, 2)))
      }
    } else {
      console.log(...args)
    }
  }
}

/**
 * Logs an Error instance to the console.
 */
function logError(error) {
  console.error(red(error.toString()))

  // Special handling for particular error types:
  if (error.name === UsageError.name && error.command != null) {
    console.error(formatUsage(error.command))
    return
  }

  const passwordError = asMaybePasswordError(error)
  if (passwordError != null && passwordError.wait != null) {
    console.error(`Please try again in ${passwordError.wait} seconds`)
    return
  }

  console.error(dim(error.stack.replace(/.*\n/, '')))
}

let pendingLogs = []

function showCoreLogs() {
  for (const line of pendingLogs) console.log(line)
  pendingLogs = []
}

/**
 * Creates a session object with a basic context object.
 */
async function makeSession(config) {
  const defaultDir =
    xdgBasedir.config != null
      ? path.join(xdgBasedir.config, '/airbitz')
      : './airbitz'
  const { authServer, appId = '', apiKey = '', directory = defaultDir } = config

  const session = {}

  session.context = await makeEdgeContext({
    apiKey,
    appId,
    authServer,
    path: directory,
    plugins: { coinbase: true, coincap: true },
    onLog(event) {
      pendingLogs.push(`${event.source}: ${event.message}`)
    }
  })
  return session
}

/**
 * Sets up a session object with the Airbitz objects needed by the command.
 * @return a promise
 */
async function prepareSession(config, cmd) {
  // Create a context if we need one:
  const session = cmd.needsContext ? await makeSession(config, cmd) : {}

  // Create a login if we need one:
  if (cmd.needsLogin) {
    if (config.username == null || config.password == null) {
      throw new UsageError(cmd, 'No login credentials')
    }

    const account = await session.context.loginWithPassword(
      config.username,
      config.password
    )
    session.account = account
  }

  return session
}

/**
 * Parses the provided command line and attempts to run the command.
 */
async function runLine(text, session) {
  const parsed = parse(text)
  if (!parsed.exec) return showCoreLogs()
  const cmd = findCommand(parsed.exec)

  if ((cmd.needsLogin || cmd.needsAccount) && session.account == null) {
    throw new UsageError(cmd, 'Please log in first')
  }

  await cmd.invoke(jsonConsole, session, parsed.args)
  showCoreLogs()
}

/**
 * Repeatedly prompts the user for a command to run.
 */
async function runPrompt(readline, session) {
  console.log('Use the `help` command for usage information')

  await new Promise((resolve, reject) => {
    function done() {
      resolve()
      readline.close()
    }

    function prompt() {
      readline.question('> ', text => {
        if (/exit/.test(text)) return done()
        runLine(text, session).catch(logError).then(prompt)
      })
    }

    readline.on('close', done)
    prompt()
  })
}

/**
 * Parses the options and invokes the requested command.
 */
async function main() {
  const { argv, options } = getopt.parseSystem()

  // Load the config file, and merge it with the command-line options:
  const config = loadConfig(options.config)
  config.apiKey = options['api-key'] ?? config.apiKey
  config.appId = options['app-id'] ?? config.appId
  config.authServer = options['auth-server'] ?? config.authServer
  config.directory = options.directory ?? config.workingDir
  config.password = options.password ?? config.password
  config.username = options.username ?? config.username

  if (argv.length === 0) {
    // Run the interactive shell:
    const session = await makeSession(config)
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      completer(line) {
        const commands = listCommands()
        const match = commands.filter(command => command.startsWith(line))
        return [match.length ? match : commands, line]
      }
    })
    await runPrompt(rl, session)
  } else {
    // Look up the command:
    const cmd =
      options.help != null || argv.length === 0
        ? helpCommand
        : findCommand(argv.shift())

    // Set up the session:
    const session = await prepareSession(config, cmd)
    // Invoke the command:
    await cmd.invoke(jsonConsole, session, argv)
    showCoreLogs()
  }
}

// Invoke the main function with error reporting:
main()
  .then(() => process.exit(0))
  .catch(error => {
    logError(error)
    process.exit(1)
  })
