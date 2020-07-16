import '../commands/all.js'

import chalk from 'chalk'
import {
  addEdgeCorePlugins,
  errorNames,
  lockEdgeCorePlugins,
  makeEdgeContext
} from 'edge-core-js'
import exchangePlugins from 'edge-exchange-plugins'
import fs from 'fs'
import parse from 'lib-cmdparse'
import Getopt from 'node-getopt'
import path from 'path'
import readline from 'readline'
import sourceMapSupport from 'source-map-support'
import xdgBasedir from 'xdg-basedir'

import { command, findCommand, listCommands, UsageError } from '../command.ts'
import { printCommandList } from '../commands/help.js'

addEdgeCorePlugins(exchangePlugins)
lockEdgeCorePlugins()

/**
 * If the function f throws an error, return that as a rejected promise.
 */
export function rejectify(f) {
  return function rejectify(...rest) {
    try {
      return f.apply(this, rest)
    } catch (e) {
      return Promise.reject(e)
    }
  }
}

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
  function(console, session, argv) {
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
        console.log(chalk.green(JSON.stringify(arg, null, 2)))
      }
    } else {
      console.log(...args)
    }
  }
}

/**
 * Logs an Error instance to the console.
 */
function logError(e) {
  console.error(chalk.red(e.toString()))

  // Special handling for particular error types:
  switch (e.name) {
    case UsageError.name:
      if (e.command != null) {
        console.error(formatUsage(e.command))
      }
      break
    case errorNames.PasswordError:
      if (e.wait) {
        console.error(`Please try again in ${e.wait} seconds`)
      }
      break
    default:
      console.error(chalk.dim(e.stack.replace(/.*\n/, '')))
      break
  }
}

/**
 * Loads the config file,
 * and returns its contents merged with the command-line options.
 */
function loadConfig(options) {
  // Locate all config files:
  const configPaths = xdgBasedir.configDirs
    .reverse()
    .map(dir => path.join(dir, '/airbitz/airbitz.conf'))
    .filter(path => fs.existsSync(path))
  if (options.config != null) {
    configPaths.push(options.config)
  }

  // Load and merge the config files:
  const configFiles = configPaths.map(path => {
    try {
      return JSON.parse(fs.readFileSync(path, 'utf8'))
    } catch (x) {
      throw new Error(`Cannot load config file "${path}"`)
    }
  })
  const config = Object.assign({}, ...configFiles)

  // Calculate the active settings:
  return {
    appId: options['app-id'] || config.appId,
    apiKey: options['api-key'] || config.apiKey,
    authServer: options['auth-server'] || config.authServer,
    directory: options.directory || config.workingDir,
    username: options.username || config.username,
    password: options.password || config.password
  }
}

/**
 * Creates a session object with a basic context object.
 */
function makeSession(config, cmd = null) {
  const session = {}

  // API key:
  let apiKey = config.apiKey
  if (config.apiKey == null) {
    apiKey = ''
  }
  let directory = config.directory
  if (directory == null) {
    directory =
      xdgBasedir.config != null ? xdgBasedir.config + '/airbitz' : './airbitz'
  }

  return makeEdgeContext({
    apiKey,
    appId: config.appId,
    authServer: config.authServer,
    path: directory,
    plugins: { coinbase: true, coincap: true }
  }).then(context => {
    session.context = context
    return session
  })
}

/**
 * Sets up a session object with the Airbitz objects needed by the command.
 * @return a promise
 */
function prepareSession(config, cmd) {
  // Create a context if we need one:
  let out = Promise.resolve(cmd.needsContext ? makeSession(config, cmd) : {})

  // Create a login if we need one:
  if (cmd.needsLogin) {
    out = out.then(session => {
      if (config.username == null || config.password == null) {
        throw new UsageError(cmd, 'No login credentials')
      }

      return session.context
        .loginWithPassword(config.username, config.password, null, {})
        .then(account => {
          session.account = account
          session.login = account.login
          return session
        })
    })
  }

  return out
}

/**
 * Parses the provided command line and attempts to run the command.
 */
function runLine(text, session) {
  const parsed = parse(text)
  const cmd = parsed.exec ? findCommand(parsed.exec) : findCommand('help')

  if ((cmd.needsLogin || cmd.needsAccount) && session.account == null) {
    throw new UsageError(cmd, 'Please log in first')
  }

  return Promise.resolve(cmd.invoke(jsonConsole, session, parsed.args))
}

/**
 * Repeatedly prompts the user for a command to run.
 */
function runPrompt(readline, session) {
  console.log('Use the `help` command for usage information')

  return new Promise((resolve, reject) => {
    function done() {
      resolve()
      readline.close()
    }

    function prompt() {
      readline.question('> ', text => {
        if (/exit/.test(text)) return done()
        rejectify(runLine)(text, session)
          .catch(logError)
          .then(prompt)
      })
    }

    readline.on('close', done)
    prompt()
  })
}

/**
 * Parses the options and invokes the requested command.
 */
function main() {
  const opt = getopt.parseSystem()

  // Load the config file:
  const config = loadConfig(opt.options)

  if (opt.argv.length === 0) {
    // Run the interactive shell:
    return makeSession(config).then(session => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        completer(line) {
          const commands = listCommands()
          const match = commands.filter(command => command.startsWith(line))
          return [match.length ? match : commands, line]
        }
      })
      return runPrompt(rl, session)
    })
  } else {
    // Look up the command:
    const cmd =
      opt.options.help || !opt.argv.length
        ? helpCommand
        : findCommand(opt.argv.shift())

    // Set up the session:
    return prepareSession(config, cmd).then(session => {
      // Invoke the command:
      return cmd.invoke(jsonConsole, session, opt.argv)
    })
  }
}

// Invoke the main function with error reporting:
rejectify(main)()
  .catch(logError)
  .then(() => process.exit(1))
