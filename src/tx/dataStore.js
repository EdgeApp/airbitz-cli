export class ABCDataStore {
  constructor (directory = '', data = {}) {
    this.dir = directory
    this.data = data
  }

// abcWallet.dataStore.listKeys(folder, callback)
  listKeys (folder) {
    const targetFolder = this.data[folder]
    let keys
    if (targetFolder) {
      keys = Object.keys(targetFolder)
      return Promise.resolve(keys)
    } else {
      return Promise.reject(new Error('Error: listKeys: invalid folder'))
    }

  }

// abcWallet.dataStore.removeKey(folder, key, callback)
  removeKey (folder, key) {
    const targetFolder = this.data[folder]
    if (targetFolder) {
      delete targetFolder[key]
      return Promise.resolve()
    } else {
      return Promise.reject(new Error('Error: removeKey: invalid folder'))
    }
  }

// abcWallet.dataStore.readData(folder, key, callback)
  readData (folder, key) {
    const targetFolder = this.data[folder]
    let targetData

    if (targetFolder) {
      targetData = targetFolder[key]
      return Promise.resolve(targetData)
    } else {
      return Promise.reject(new Error('Error: readData: invalid folder'))
    }

  }

// writeData(folder, key, value, callback)
  writeData (folder, key, newValue) {
    const folderExists = Object.keys(this.data).includes(folder)

    if (!folderExists) {
      this.data[folder] = {}
    }
    this.data[folder][key] = newValue
    return Promise.resolve()
  }

// abcWallet.dataStore.removeFolder(folder, callback)
  removeFolder (folder) {
    delete this.data[folder]
    return Promise.resolve()
  }
}
