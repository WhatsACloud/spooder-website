const baseBud = {
  word: '',
  definition: '',
  sound: '',
  context: '',
  example: '',
  link: 0,
  attachedTos: [],
  position: null,
  objId: null,
  type: "bud",
}

class Bud {
  _json = {}
  fromJSON = ({ word, definition, sound, context, example, link, attachedTos, position, objId }) => {
    this._json = {
      word: word,
      definition: definition,
      sound: sound,
      context: context,
      example: example,
      link: link,
      attachedTos: attachedTos,
      position: position,
      objId: objId,
      type: "bud",
    }
  }
  toJSON = () => {return this._json}
  setJSONAttr = (attr, val) => {
    if (val === null) {
      delete this._json[attr]
      return
    }
    this._json[attr] = val
  }
  constructor(bud) {
    let abort = false
    if (!bud) {console.warn(`bud is ${bud}, aborting...`); return null}
    if (!bud.position) {console.warn('WARNING: position is not set!'); abort = true}
    if (!bud.objId) {console.warn('WARNING: objId is not set!'); abort = true}
    if (abort) {console.warn('aborting...'); return null}
    const obj = {...baseBud}
    for (const [ attr, val ] of Object.entries(bud)) {
      if (attr in obj) {
        obj[attr] = val
      }
    }
    this.fromJSON({
      word: obj.word,
      definition: obj.definition,
      sound: obj.sound,
      context: obj.context,
      example: obj.example,
      link: obj.link,
      attachedTos: obj.attachedTos,
      position: obj.position,
      objId: obj.objId
    })
  }
}
module.exports.Cbud = Bud