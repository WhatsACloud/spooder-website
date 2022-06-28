import * as utils from '../utils'

class Operation {
  name = null
  keys = null
  opType = utils.ObjType.All
  func = null
  constructor(name, func=null, keys=null, opType=utils.ObjType.All) {
    this.name = name
    this.keys = keys
    this.opType = opType
    this.func = () => {
      func()
      utils.clearSelected()
    }
    const keybinds = utils.getGlobals().keybinds
    keybinds.add(keys.map(e => {
      return e[0]
    }), func)
  }
}
export { Operation }

class Operations {
  operations = {
    [utils.ObjType.All]: [],
    [utils.ObjType.Bud]: [],
    [utils.ObjType.Silk]: [],
    [utils.ObjType.Default]: [],
  }
  add(operation) {
    this.operations[operation.opType].push(operation)
  }
  constructor() {}
}
export { Operations }