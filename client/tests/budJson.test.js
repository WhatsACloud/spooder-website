const proxyConfig = {
  deleteProperty: (target, property) => {
    delete target[property]
    BudJson.checkForUpdate(target, oldTarget)
    return true
  },
  set: (target, property, value, receiver) => {
    const oldTarget = isArray(target) ? [...target] : {...target}
    let plsCheck = false
    if (property === "length") plsCheck = true
    if (isArray(target)) {
      if (!target.includes(value)) {
        plsCheck = true
      }
    } else {
      plsCheck = true
    }
    if (plsCheck) {
      Reflect.set(target, property, value)
      BudJson.checkForUpdate(target, oldTarget)
      return true
    }
    return false
  }
}

const isArray = (val) => { return val.constructor === Array }
const isObject = (val) => { return val.constructor === Object }

const compare = (var1, var2, func=null) => { // checks if is object or array, and does things accordingly
  if (isObject(var1) && isObject(var2)) {
    if (!(compareObjects(var1, var2))) return false
  } else if (isArray(var1) && isArray(var2)) {
    if (!(compareArrays(var1, var2))) return false
  } else {
    return func ? func() : true
  }
  return true
}

const compareArrays = (arr1, arr2) => {
  if (!(isArray(arr1)) || !(isArray(arr2))) return false
  if (arr1.length !== arr2.length) return false
  for (const e of arr1) {
    if (!(arr2.includes(e))) return false
  }
  return true
}

const compareObjects = (arr1, arr2) => {
  if (!(isObject(arr1)) || !(isObject(arr2))) return false
  if (arr1.length !== arr2.length) return false
  for (const key of Object.keys(arr1)) {
    const same = compare(arr1[key], arr2[key], () => {
      if (arr1[key] !== arr2[key]) return false
      return true
    })
    if (!same) return false
  }
  return true
}

let changed = false

class BudJson {
  static base = {
    word: '',
    definition: '',
    sound: '',
    context: '',
    example: '',
    link: 0,
    attachedTos: [],
    position: {x: 0, y: 0},
    objId: null,
  }
  static checkForUpdate(var1, var2) {
    let check = false
    if (var1.constructor !== var2.constructor) throw new Error(`WARNING: setting ${var1} of type ${typeof var1} as ${var2} which is of type ${typeof var2}`)
    if (isArray(var1)) {
      if (!(compareArrays(var1, var2))) check = true
    } else if (isObject(var1)) {
      if (!(compareObjects(var1, var2))) check = true
    } else {
      if (var1 !== var2) check = true
    }
    if (check) {
      console.log('woah! It changed!')
      changed = true
    }
  }
  get word() { return this.json.word }
  get definition() { return this.json.definition }
  get sound() { return this.json.sound }
  get context() { return this.json.context }
  get example() { return this.json.example }
  get link() { return this.json.link }
  get attachedTos() { return this.json.attachedTos }
  get position() { return this.json.position }
  get objId() { return this.json.objId }
  set word(word) { this.BudJson.checkForUpdate(word, this.json.word); this.json.word = word }
  set definition(definition) { this.BudJson.checkForUpdate(definition, this.json.definition); this.json.definition = definition}
  set sound(sound) { this.BudJson.checkForUpdate(sound, this.json.sound); this.json.sound = sound}
  set context(context) { this.BudJson.checkForUpdate(context, this.json.context); this.json.context = context}
  set example(example) { this.BudJson.checkForUpdate(example, this.json.example); this.json.example = example}
  set link(link) { this.BudJson.checkForUpdate(link, this.json.link); this.json.link = link}
  set attachedTos(attachedTos) { this.BudJson.checkForUpdate(attachedTos, this.json.attachedTos); this.json.attachedTos = new Proxy(attachedTos, proxyConfig)}
  set position(position) { this.BudJson.checkForUpdate(position, this.json.position); this.json.position = new Proxy(position, proxyConfig)}
  set objId(objId) { this.BudJson.checkForUpdate(objId, this.json.objId); this.json.objId = objId}
  json = JSON.parse(JSON.stringify(BudJson.base))
  constructor(leJson) {
    for (const attr of Object.keys(leJson)) {
      if (!(attr in BudJson.base)) {
        console.warn(`WARNING: given JSON contains (${attr}) of value (${leJson[attr]}) which is not an attribute of bud. (bud ${this.objId})`)
        continue
      } else if (!(typeof BudJson.base[attr] === typeof leJson[attr])) {
        console.warn(`WARNING: (${attr}) should be of type ${typeof Bud.base[attr]}, not ${typeof leJson[attr]}. (${this.objId})`)
        continue
      }
      switch (leJson[attr]?.constructor) {
        case Array:
          this.json[attr] = new Proxy(leJson[attr], proxyConfig)
          break
        case Object:
          this.json[attr] = new Proxy(leJson[attr], proxyConfig)
          break
        default:
          this.json[attr] = leJson[attr]
      }
    }
  }
}

const bud = {
  word: '',
  definition: '',
  sound: '',
  context: '',
  example: '',
  link: 0,
  attachedTos: [],
  position: {x: 69, y: 69},
  objId: null,
}

const bud2 = {
  word: 'word',
  definition: '',
  sound: '',
  context: '',
  example: '',
  link: 0,
  attachedTos: [],
  position: {x: 0, y: 0},
  objId: null,
}

const CBud1 = new BudJson(bud)
const CBud2 = new BudJson(bud2)

test('Ensure that BudJson class is in working order.', () => {
  CBud1.attachedTos.push(1)
  CBud1.attachedTos.push(2)
  expect(CBud1.attachedTos).toEqual([1, 2])
})