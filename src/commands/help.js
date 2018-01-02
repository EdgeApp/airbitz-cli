import { UsageError, command, findCommand, listCommands } from '../command.js'

function formatUsage (cmd) {
  let out = 'Usage: ' + cmd.name
  if (cmd.usage != null) {
    out += ' ' + cmd.usage
  }
  return out
}

export function printCommandList (console) {
  console.log('Available commands:')
  listCommands().forEach(name => {
    const cmd = findCommand(name)
    let line = '  ' + name
    if (cmd.help != null) {
      line += '\t- ' + cmd.help
    }
    console.log(line)
  })
}

command(
  'help',
  {
    usage: '[command]',
    help: 'Displays help for any command'
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
      printCommandList(console)
    }
  }
)
