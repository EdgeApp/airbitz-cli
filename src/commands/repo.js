import { base16 } from 'rfc4648'

import { UsageError, command } from '../command.js'

command(
  'repo-sync',
  {
    usage: '<sync-key>',
    help: 'Fetches the contents of a sync repo',
    needsContext: true
  },
  function (console, session, argv) {
    if (argv.length !== 1) throw new UsageError(this)
    const syncKey = base16.parse(argv[0])

    const internal = session.context.$internalStuff
    internal.syncRepo(syncKey).then(results => {
      const changed = results.changes.length !== 0
      console.log(changed ? 'changed' : 'unchanged')
      return changed
    })
  }
)

command(
  'repo-list',
  {
    usage: '<sync-key> <data-key> [<path>]',
    help: 'Shows the contents of a sync repo folder',
    needsContext: true
  },
  function (console, session, argv) {
    if (argv.length < 2 || argv.length > 3) throw new UsageError(this)
    const syncKey = base16.parse(argv[0])
    const dataKey = base16.parse(argv[1])
    const path = argv.length === 3 ? argv[2] : ''

    const internal = session.context.$internalStuff
    return internal
      .getRepoDisklet(syncKey, dataKey)
      .then(disklet => disklet.list(path))
      .then(listing => console.log(listing))
  }
)

command(
  'repo-set',
  {
    usage: '<sync-key> <data-key> <path> <value>',
    help: 'Writes a file to the sync repo',
    needsContext: true
  },
  function (console, session, argv) {
    if (argv.length !== 4) throw new UsageError(this)
    const syncKey = base16.parse(argv[0])
    const dataKey = base16.parse(argv[1])
    const path = argv[2]
    const value = argv[3]

    const internal = session.context.$internalStuff
    return internal
      .getRepoDisklet(syncKey, dataKey)
      .then(disklet => disklet.setText(path, value))
  }
)

command(
  'repo-get',
  {
    usage: '<sync-key> <data-key> <path>',
    help: 'Reads a file from the sync repo',
    needsContext: true
  },
  function (console, session, argv) {
    if (argv.length !== 3) throw new UsageError(this)
    const syncKey = base16.parse(argv[0])
    const dataKey = base16.parse(argv[1])
    const path = argv[2]

    const internal = session.context.$internalStuff
    return internal
      .getRepoDisklet(syncKey, dataKey)
      .then(disklet => disklet.getText(path))
      .then(text => console.log(text))
  }
)
