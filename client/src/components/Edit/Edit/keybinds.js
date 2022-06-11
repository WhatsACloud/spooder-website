
class Keybinds {
  // enums
  static keyUp = Symbol('keyUp')
  static keyDown = Symbol('keyDown')

  binds = {}
  down = {}
  add(key, func, type=Keybinds.keyDown) {
    // if (!type) type = Keybinds.keyDown
    console.log(type)
    if (!this.binds[key]) {
      this.binds[key] = [{func: func, type: type}]
      return
    }
    this.binds[key].push({func: func, type: type})
    this.down[key] = false
  }
  del(key, func) {
    if (!this.binds[key])
    for (i = 0; i < this.binds[key].length; i++) {
      const fn = this.binds[key][i].func
      if (fn === func) {
        this.binds[key].splice(i, 1)
      }
    }
    delete this.down[key]
  }
  isDown(key) { return this.down[key] }
  constructor(debugMode) {
    document.addEventListener('keydown', (e) => {
      if (e.key in this.binds) {
        console.log(this.binds[e.key])
        for (const { func, type } of this.binds[e.key]) {
          if (type === Keybinds.keyDown) {
            func(e)
          }
        }
        this.down[e.key] = true
      } else if (debugMode) {
        console.log(e.key)
      }
    })
    document.addEventListener('keyup', (e) => {
      if (e.key in this.binds) {
        for (const { func, type } of this.binds[e.key]) {
          if (type === Keybinds.keyUp) func(e)
        }
        this.down[e.key] = false
      }
    })
  }
}
export { Keybinds }