import { UsageError, command } from '../command.js'

command(
  'plugin-data-list',
  {
    usage: '[<plugin-id>]',
    help: 'Lists the either plugins in the store, or the items within a plugin',
    needsAccount: true
  },
  function (console, session, argv) {
    if (argv.length !== 0 && argv.length !== 1) throw new UsageError(this)
    const pluginId = argv[0]

    if (pluginId) {
      return session.account.pluginData
        .listItemIds(pluginId)
        .then(names => console.log(names))
    } else {
      return session.account.pluginData
        .listPluginIds()
        .then(names => console.log(names))
    }
  }
)

command(
  'plugin-data-delete',
  {
    usage: '<plugin-id> [<item-name>]',
    help: "Deletes the either a single item, or an entire plugin's data",
    needsAccount: true
  },
  function (console, session, argv) {
    if (argv.length !== 1 && argv.length !== 2) throw new UsageError(this)
    const pluginId = argv[0]
    const itemId = argv[1]

    if (itemId) {
      return session.account.pluginData.deleteItem(pluginId, itemId)
    } else {
      return session.account.pluginData.deletePlugin(pluginId)
    }
  }
)

command(
  'plugin-data-get',
  {
    usage: '<plugin-id> <item-name>',
    help: 'Gets an item from a plugin data store',
    needsAccount: true
  },
  function (console, session, argv) {
    if (argv.length !== 2) throw new UsageError(this)
    const pluginId = argv[0]
    const itemId = argv[1]

    return session.account.pluginData
      .getItem(pluginId, itemId)
      .then(text => console.log(text))
  }
)

command(
  'plugin-data-set',
  {
    usage: '<plugin-id> <item-name> <text>',
    help: 'Puts an into a plugin data store',
    needsAccount: true
  },
  function (console, session, argv) {
    if (argv.length !== 3) throw new UsageError(this)
    const pluginId = argv[0]
    const itemId = argv[1]
    const text = argv[2]

    return session.account.pluginData.setItem(pluginId, itemId, text)
  }
)
