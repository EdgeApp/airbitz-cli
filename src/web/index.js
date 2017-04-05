import { makeContext } from 'airbitz-core-js'
import { command } from '../command.js'
import '../commands/all.js'
import parse from 'lib-cmdparse'

/**
 * Adds text to the output area.
 */
function appendLine (text) {
  // Create a new div element:
  const newDiv = document.createElement('div')
  newDiv.appendChild(document.createTextNode(text))

  // Add that to the output:
  const output = document.getElementById('output')
  output.appendChild(newDiv)

  // Scroll the page:
  window.scrollTo(0, document.body.scrollHeight)
}

/**
 * Creates the session and switches to the CLI screen.
 */
function onStart (event) {
  const opts = {}

  // Load options:
  const keys = ['apiKey', 'appId', 'authServer']
  keys.forEach(key => {
    const value = document.getElementById(key).value
    if (value == null) {
      console.log(`error: ${key} is blank`)
    }
    window.localStorage.setItem('airbitz-cli/' + key, value)
    opts[key] = value
  })
  appendLine('Ready')

  const context = makeContext(opts)

  // Create session:
  window.session = {
    context
  }
}

/**
 * Handles the user pressing enter.
 */
function onEnter (event) {
  const raw = document.getElementById('command')
  const line = raw.value
  raw.value = ''

  try {
    const parsed = parse(line)

    if (!window.session) {
      onStart()
    }

    // Look up the command:
    const helpCommand = null
    const cmd = parsed.exec ? command.find(parsed.exec) : helpCommand

    // Execute the command:
    appendLine(line)

    // Invoke the command:
    cmd.invoke(window.session, parsed.args).catch(e => appendLine(e.message))
  } catch (e) {
    appendLine(e.message)
  }
}

function main () {
  // Set up defaults:
  const keys = ['apiKey', 'appId', 'authServer']
  keys.forEach(key => {
    const value = window.localStorage.getItem('airbitz-cli/' + key)
    if (value != null) {
      document.getElementById(key).value = value
    }
  })

  // Set up start handler:
  document.getElementById('setup').addEventListener('submit', onStart)

  // Set up enter key listener:
  document.getElementById('command').addEventListener('keyup', event => {
    if (event.keyCode === 13) {
      onEnter(event)
    }
  })
}

main()
