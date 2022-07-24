
class Keybinds {
  // enums
  static keyUp = Symbol('keyUp')
  static keyDown = Symbol('keyDown')

  binds = {}
  down = {}
  add(keys, func, type=Keybinds.keyDown) {
    const single = keys.length === 1
    if (!single) {
      for (const key of keys) {
        this.down[key] = false
        if (!this.binds[key]) {
          this.binds[key] = [{func: func, type: type, keyCombi: single ? null : [...keys]}]
          continue
        }
        this.binds[key].push({func: func, type: type, keyCombi: single ? null : [...keys]})
      }
    } else {
      const key = keys
      if (!this.binds[key]) {
        this.binds[key] = [{func: func, type: type, keyCombi: single ? null : [...keys]}]
        return
      }
      this.binds[key].push({func: func, type: type, keyCombi: single ? null : [...keys]})
      this.down[key] = false
    }
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
      const keyPressed = e.key.length > 1 ? e.key : e.key.toLowerCase()
      if (keyPressed in this.binds) {
        this.down[keyPressed] = true
        for (const { func, type, keyCombi } of this.binds[keyPressed]) {
          if (type === Keybinds.keyDown) {
            let all = true
            console.log(keyCombi)
            console.log(this.down['z'], this.down['Control'], this.down['Shift'])
            if (keyCombi !== null) {
              for (const leKey of keyCombi) {
                if (!(this.down[leKey])) {
                  all = false
                  break
                }
              }
              for (const key of Object.keys(this.down)) {
                if (!(keyCombi.includes(key)) && this.down[key]) {
                  all = false
                  break
                }
              }
            } else {
              func(e)
              continue
            }
            console.log(all)
            if (all) func(e)
          }
        }
      } else if (debugMode) {
        console.log(e.key)
      }
    })
    document.addEventListener('keyup', (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (key in this.binds) {
        for (const { func, type } of this.binds[key]) {
          if (type === Keybinds.keyUp) func(e)
        }
        this.down[key] = false
      }
    })
  }
}
export { Keybinds }