export class ABCDataStore {
  constructor (directory, data = {}) {
    this.dir = directory
    this.data = data
  }

// abcWallet.dataStore.listKeys(folder, callback)
  listKeys (folder) {
    const targetFolder = this.data[folder]
    let keys
    if (targetFolder) {
      keys = Object.keys(targetFolder)
    }

    return keys
  }

// abcWallet.dataStore.removeKey(folder, key, callback)
  removeKey (folder, key) {
    const targetFolder = this.data[folder]
    if (targetFolder) {
      delete targetFolder[key]
    }
  }

// abcWallet.dataStore.readData(folder, key, callback)
  readData (folder, key) {
    const targetFolder = this.data[folder]
    let targetData

    if (targetFolder) {
      targetData = targetFolder[key]
    }

    return targetData
  }

// writeData(folder, key, value, callback)
  writeData (folder, key, newValue) {
    const folderExists = Object.keys(this.data).includes(folder)

    if (!folderExists) {
      this.data[folder] = {}
    }
    this.data[folder][key] = newValue
  }

// abcWallet.dataStore.removeFolder(folder, callback)
  removeFolder (folder) {
    delete this.data[folder]
  }
}
