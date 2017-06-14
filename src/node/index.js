// Airbitz context stuff:
import { internal, makeContext, PasswordError } from 'airbitz-core-js'
import { makeNodeIo } from 'airbitz-io-node-js'
const { rejectify } = internal

// Commands:
import { command, findCommand, UsageError } from '../command.js'
import { printCommandList } from '../commands/help.js'
import '../commands/all.js'

// Command-line tools:
import chalk from 'chalk'
import fs from 'fs'
import Getopt from 'node-getopt'
import path from 'path'
import sourceMapSupport from 'source-map-support'
import xdgBasedir from 'xdg-basedir'

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

function formatUsage (cmd) {
  // Set up the help options:
  let out = 'Usage: ' + cmd.name
  if (cmd.needsContext) {
    out += ' [-k <api-key>] [-d <work-dir>]'
  }
  if (cmd.needsLogin) {
    out += ' -u <username> -p <password>'
  }
  if (cmd.usage != null) {
    out += ' ' + cmd.usage
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
  log (...args) {
    if (args.length === 1) {
      const arg = args[0]
      if (typeof arg === 'string') {
        console.log(arg)
      } else if (arg instanceof Error) {
        console.log(chalk.red(arg.toString()))
      } else {
        console.log(chalk.green(JSON.stringify(arg, null, 2)))
      }
    } else {
      console.log(...args)
    }
  }
}

/**
 * Loads the config file,
 * and returns its contents merged with the command-line options.
 */
function loadConfig (options) {
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
      const e = new Error(`Cannot load config file "${options.config}"`)
      e.type = 'ConfigError'
      throw e
    }
  })
  const config = Object.assign({}, ...configFiles)

  // Calculate the active settings:
  return {
    appId: options['app-id'] || config['appId'],
    apiKey: options['api-key'] || config['apiKey'],
    authServer: options['auth-server'] || config['authServer'],
    directory: options['directory'] || config['workingDir'],
    username: options['username'] || config['username'],
    password: options['password'] || config['password']
  }
}

/**
 * Sets up a session object with the Airbitz objects
 * needed by the command.
 * @return a promise
 */
function makeSession (config, cmd) {
  const session = {}
  let out = Promise.resolve(session)

  // Create a context if we need one:
  if (cmd.needsContext) {
    // API key:
    if (config.apiKey == null) {
      throw new UsageError(cmd, 'No API key')
    }
    let directory = config.directory
    if (directory == null) {
      directory = xdgBasedir.config != null
        ? xdgBasedir.config + '/airbitz'
        : './airbitz'
    }

    session.context = makeContext({
      appId: config.appId,
      apiKey: config.apiKey,
      authServer: config.authServer,
      io: makeNodeIo(directory)
    })
  }

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
 * Parses the options and invokes the requested command.
 */
function main () {
  const opt = getopt.parseSystem()

  // Look up the command:
  const cmd = opt.options['help'] || !opt.argv.length
    ? helpCommand
    : findCommand(opt.argv.shift())

  // Load the config file:
  const config = loadConfig(opt.options)

  // Set up the session:
  return makeSession(config, cmd).then(session => {
    // Invoke the command:
    return cmd.invoke(jsonConsole, session, opt.argv)
  })
}

// Invoke the main function with error reporting:
rejectify(main)().catch(e => {
  console.error(chalk.red(e.toString()))

  // Special handling for particular error types:
  switch (e.name) {
    case UsageError.name:
      if (e.command != null) {
        console.error(formatUsage(e.command))
      }
      break
    case PasswordError.name:
      if (e.wait) {
        console.error(`Please try again in ${e.wait} seconds`)
      }
      break
  }
  process.exit(1)
})
